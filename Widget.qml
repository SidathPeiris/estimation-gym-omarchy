import QtQuick
import Quickshell
import Quickshell.Io
import qs.Commons
import qs.Ui
import "Model.js" as Model
import "content/questions.js" as QuestionBank

// Daily Fermi-estimation puzzle. Bar chip shows today's status + current
// streak; clicking opens a panel with the question, a numeric guess field,
// and (after submitting) the order-of-magnitude scoring breakdown.
Panel {
  id: root

  ipcTarget: "estimation-gym"

  readonly property color foreground: bar ? bar.foreground : Color.foreground
  readonly property color dim: Qt.darker(foreground, 1.55)
  readonly property color urgent: bar ? bar.urgent : Color.urgent
  readonly property string fontFamily: bar ? bar.fontFamily : Style.font.family

  readonly property int today: Model.dayIndex(new Date())
  onTodayChanged: hintShown = false
  readonly property var question: Model.questionForDay(today, QuestionBank.QUESTIONS)
  readonly property bool answeredToday: Model.hasAnsweredDay(stateData, today)
  readonly property var todayResult: answeredToday ? stateData.history[String(today)] : null

  property string guessText: ""
  property string guessError: ""
  // Whether today's hint has been revealed. Reset when the day rolls over so
  // yesterday's hint cannot quietly halve today's points.
  property bool hintShown: false
  readonly property var strategy: question ? Model.strategyFor(question) : null
  property bool statsExpanded: false
  property bool historyExpanded: false
  readonly property var historyDays: Model.historyDays(stateData)
  // Open until the first day is played, where "how to play" is the whole
  // question, then collapsed so it stays clear of the daily puzzle.
  property bool howToExpanded: !hasAnyHistory
  readonly property bool hasAnyHistory: {
    var h = stateData && stateData.history
    if (!h) return false
    for (var k in h) return true
    return false
  }
  property var stateData: Model.emptyState()
  readonly property var stats: Model.computeStats(stateData)
  readonly property string statePath: Quickshell.env("HOME") + "/.local/state/estimation-gym/state.json"

  function loadState(raw) {
    try {
      var parsed = JSON.parse(raw)
      // A missing/first-run file parses to "{}", which is a valid object but
      // not a valid state shape - only trust it once it has a history field.
      stateData = (parsed && typeof parsed === "object" && parsed.history !== undefined)
        ? parsed
        : Model.emptyState()
    } catch (e) {
      stateData = Model.emptyState()
    }
  }

  function saveState() {
    stateFile.setText(JSON.stringify(root.stateData, null, 2) + "\n")
  }

  function bandColor(band) {
    if (band === "Bullseye") return Color.accent
    if (band === "Close") return Color.accent
    if (band === "Ballpark") return foreground
    return urgent
  }

  function submitGuess() {
    var guess = Number(guessText)
    if (guessText.trim() === "" || !isFinite(guess) || guess <= 0) {
      guessError = qsTr("Enter a positive number")
      return
    }
    guessError = ""
    stateData = Model.recordAnswer(stateData, today, guess, question.answerValue, hintShown)
    saveState()
  }

  onOpenedChanged: {
    if (!opened || answeredToday) return
    Qt.callLater(function() { guessInput.forceActiveFocus() })
  }

  // mkdir -p as a defensive fallback in case FileView doesn't create the
  // state directory itself on first write.
  Process {
    id: ensureStateDir
    command: ["mkdir", "-p", Quickshell.env("HOME") + "/.local/state/estimation-gym"]
    running: true
  }

  FileView {
    id: stateFile
    path: root.statePath
    watchChanges: true
    atomicWrites: true
    printErrors: false
    onLoaded: root.loadState(text())
    onLoadFailed: root.loadState("{}")
    onFileChanged: reload()
  }

  implicitWidth: button.implicitWidth
  implicitHeight: button.implicitHeight

  Item {
    id: button

    readonly property bool vertical: root.bar ? root.bar.vertical : false
    readonly property int barSize: root.bar ? root.bar.barSize : Style.bar.sizeHorizontal
    property var registeredBar: null

    implicitWidth: vertical ? barSize : chipRow.implicitWidth + Style.space(12)
    implicitHeight: barSize

    function syncClickRegistration() {
      if (registeredBar && registeredBar.unregisterClickTarget) registeredBar.unregisterClickTarget(button)
      registeredBar = root.bar
      if (registeredBar && registeredBar.registerClickTarget) registeredBar.registerClickTarget(button)
    }

    Component.onCompleted: syncClickRegistration()
    Component.onDestruction: if (registeredBar && registeredBar.unregisterClickTarget) registeredBar.unregisterClickTarget(button)

    Connections {
      target: root
      function onBarChanged() { button.syncClickRegistration() }
    }

    Row {
      id: chipRow
      anchors.centerIn: parent
      spacing: Style.space(5)

      Text {
        text: "\u{1F3AF}" // target emoji: today's estimation target
        font.pixelSize: Style.font.body
        anchors.verticalCenter: parent.verticalCenter
      }

      Text {
        text: root.answeredToday
          ? root.todayResult.band + (root.stateData.streak > 0 ? " · x" + root.stateData.streak : "")
          : qsTr("Guess")
        color: root.answeredToday ? root.bandColor(root.todayResult.band) : root.foreground
        font.family: root.fontFamily
        font.pixelSize: Style.font.bodySmall
        font.bold: true
        anchors.verticalCenter: parent.verticalCenter
      }
    }

    MouseArea {
      anchors.fill: parent
      hoverEnabled: true
      cursorShape: Qt.PointingHandCursor
      onEntered: if (root.bar) root.bar.showTooltip(button, qsTr("Today's estimation puzzle"))
      onExited: if (root.bar) root.bar.hideTooltip(button)
      onClicked: root.toggle()
    }
  }

  KeyboardPanel {
    id: panel

    anchorItem: button
    owner: root
    bar: root.bar
    open: root.opened
    focusTarget: keyCatcher
    contentWidth: panel.fittedContentWidth(Style.space(360))
    contentHeight: panel.fittedContentHeight(content.implicitHeight, Style.space(700))

    PanelKeyCatcher {
      id: keyCatcher

      anchors.fill: parent
      // Without this, PanelKeyCatcher's BeforeItem key priority would swallow
      // Enter/arrow keys meant for the guess field (see its own doc comment
      // on the inline-editor pattern).
      blocked: guessInput.activeFocus
      onCloseRequested: root.close()

      Column {
        id: content
        width: parent.width
        spacing: Style.space(12)

        PanelHero {
          width: parent.width
          title: qsTr("Estimation Gym")
          meta: Model.formatDay(root.today)
          foreground: root.foreground
          fontFamily: root.fontFamily
        }

        Text {
          width: parent.width
          text: qsTr("Streak %1 · Best %2").arg(root.stateData.streak).arg(root.stateData.bestStreak)
          color: root.dim
          font.family: root.fontFamily
          font.pixelSize: Style.font.caption
        }

        // Questions about quantities that drift are pinned to a year, so the
        // answer stays correct instead of quietly rotting.
        Text {
          width: parent.width
          visible: root.question && root.question.asOf !== undefined
          text: root.question && root.question.asOf !== undefined
            ? qsTr("as of %1").arg(root.question.asOf)
            : ""
          color: root.dim
          font.family: root.fontFamily
          font.pixelSize: Style.font.caption
        }

        Text {
          width: parent.width
          text: root.question ? root.question.prompt : qsTr("No question available")
          color: root.foreground
          font.family: root.fontFamily
          font.pixelSize: Style.font.body
          wrapMode: Text.WordWrap
        }

        // --- Not yet answered: guess input ---
        Column {
          width: parent.width
          spacing: Style.space(8)
          visible: !root.answeredToday

          Row {
            width: parent.width
            spacing: Style.space(8)

            TextField {
              id: guessInput
              width: parent.width - submitButton.width - Style.space(8)
              anchors.verticalCenter: parent.verticalCenter
              foreground: root.foreground
              font.family: root.fontFamily
              font.pixelSize: Style.font.body
              text: root.guessText
              placeholderText: root.question ? qsTr("Guess (%1)").arg(root.question.unit) : ""
              validator: DoubleValidator { bottom: 0; notation: DoubleValidator.ScientificNotation }
              onTextChanged: root.guessText = text
              onAccepted: root.submitGuess()
            }

            PanelActionButton {
              id: submitButton
              anchors.verticalCenter: parent.verticalCenter
              iconText: qsTr("Go")
              tooltipText: qsTr("Submit guess")
              foreground: root.foreground
              fontFamily: root.fontFamily
              onClicked: root.submitGuess()
            }
          }

          Text {
            visible: root.guessError !== ""
            text: root.guessError
            color: root.urgent
            font.family: root.fontFamily
            font.pixelSize: Style.font.caption
          }

          // --- Hint: how to think about this shape of problem ---
          // Deliberately says nothing about the answer, only about the method,
          // so a player who takes it still has to do the estimating.
          Item {
            width: parent.width
            visible: !root.hintShown && root.strategy
            implicitHeight: hintToggle.implicitHeight

            Text {
              id: hintToggle
              anchors.left: parent.left
              text: "▸ " + qsTr("Hint")
              color: root.foreground
              font.family: root.fontFamily
              font.pixelSize: Style.font.bodySmall
              font.bold: true
            }

            Text {
              anchors.right: parent.right
              anchors.baseline: hintToggle.baseline
              text: qsTr("scores half points")
              color: root.dim
              font.family: root.fontFamily
              font.pixelSize: Style.font.caption
            }

            MouseArea {
              anchors.fill: parent
              hoverEnabled: true
              cursorShape: Qt.PointingHandCursor
              onClicked: root.hintShown = true
            }
          }

          Column {
            width: parent.width
            spacing: Style.space(4)
            visible: root.hintShown && root.strategy

            Text {
              width: parent.width
              text: root.strategy ? root.strategy.label : ""
              color: root.foreground
              font.family: root.fontFamily
              font.pixelSize: Style.font.bodySmall
              font.bold: true
              wrapMode: Text.WordWrap
            }

            Text {
              width: parent.width
              text: root.strategy ? root.strategy.guidance : ""
              color: root.dim
              font.family: root.fontFamily
              font.pixelSize: Style.font.caption
              wrapMode: Text.WordWrap
            }
          }
        }

        // --- Answered: result breakdown ---
        Column {
          width: parent.width
          spacing: Style.space(10)
          visible: root.answeredToday

          BorderSurface {
            width: parent.width
            implicitHeight: resultContent.implicitHeight + Style.space(24)
            color: Style.normalFillFor(root.foreground, root.bandColor(root.todayResult ? root.todayResult.band : "Off"))
            borderSpec: Border.controlSpec("normal", root.foreground, root.bandColor(root.todayResult ? root.todayResult.band : "Off"))
            radius: Style.cornerRadius

            Column {
              id: resultContent
              anchors.fill: parent
              anchors.margins: Style.space(12)
              spacing: Style.space(6)

              Item {
                width: parent.width
                implicitHeight: bandLabel.implicitHeight

                Text {
                  id: bandLabel
                  anchors.left: parent.left
                  text: root.todayResult ? root.todayResult.band : ""
                  color: root.bandColor(root.todayResult ? root.todayResult.band : "Off")
                  font.family: root.fontFamily
                  font.pixelSize: Style.font.heading
                  font.bold: true
                }

                Text {
                  anchors.right: parent.right
                  anchors.baseline: bandLabel.baseline
                  text: root.todayResult
                    ? (root.todayResult.assisted
                        ? qsTr("+%1 pts · hint").arg(Model.pointsForBand(root.todayResult.band, true))
                        : qsTr("+%1 pts").arg(Model.pointsForBand(root.todayResult.band)))
                    : ""
                  color: root.bandColor(root.todayResult ? root.todayResult.band : "Off")
                  font.family: root.fontFamily
                  font.pixelSize: Style.font.body
                  font.bold: true
                }
              }

              Text {
                width: parent.width
                text: root.todayResult
                  ? qsTr("Your guess: %1 %2").arg(Model.formatCompact(root.todayResult.guess)).arg(root.question.unit)
                  : ""
                color: root.foreground
                font.family: root.fontFamily
                font.pixelSize: Style.font.bodySmall
                wrapMode: Text.WordWrap
              }

              // Read back from the stored result rather than from today's
              // question: growing the bank reshuffles which question falls on
              // which day, so an answer recorded earlier must still be shown
              // against the value it was actually scored against.
              Text {
                width: parent.width
                text: root.todayResult && root.question
                  ? qsTr("Actual: %1 %2")
                      .arg(Model.formatCompact(root.todayResult.answerValue !== undefined
                        ? root.todayResult.answerValue
                        : root.question.answerValue))
                      .arg(root.question.unit)
                  : ""
                color: root.foreground
                font.family: root.fontFamily
                font.pixelSize: Style.font.bodySmall
                wrapMode: Text.WordWrap
              }

              Text {
                width: parent.width
                text: root.todayResult
                  ? qsTr("Off by %1 orders of magnitude").arg(root.todayResult.distanceDecades !== null ? root.todayResult.distanceDecades.toFixed(2) : "?")
                  : ""
                color: root.dim
                font.family: root.fontFamily
                font.pixelSize: Style.font.caption
              }
            }
          }

          Text {
            width: parent.width
            visible: root.strategy
            text: root.strategy ? qsTr("Approach: %1").arg(root.strategy.label) : ""
            color: root.foreground
            font.family: root.fontFamily
            font.pixelSize: Style.font.caption
            font.bold: true
            wrapMode: Text.WordWrap
          }

          Text {
            width: parent.width
            text: root.question ? qsTr("How to think about it: %1").arg(root.question.decompositionHint) : ""
            color: root.dim
            font.family: root.fontFamily
            font.pixelSize: Style.font.caption
            wrapMode: Text.WordWrap
          }

          Text {
            width: parent.width
            visible: root.question && root.question.source
            text: root.question ? qsTr("Source: %1").arg(root.question.source) : ""
            color: root.dim
            font.family: root.fontFamily
            font.pixelSize: Style.font.caption
            font.italic: true
            wrapMode: Text.WordWrap
          }
        }

        // --- How to play ---
        // Content comes from Model.HOW_TO_PLAY and Model.scoringRows() so this
        // and the phone app teach the same rules in the same words, and the
        // points quoted cannot drift from what scoring actually awards.
        Column {
          width: parent.width
          spacing: Style.space(8)

          Rectangle {
            width: parent.width
            height: 1
            color: root.dim
            opacity: 0.3
          }

          Item {
            width: parent.width
            implicitHeight: howToToggle.implicitHeight

            Text {
              id: howToToggle
              anchors.left: parent.left
              text: (root.howToExpanded ? "▾ " : "▸ ") + qsTr("How to play")
              color: root.foreground
              font.family: root.fontFamily
              font.pixelSize: Style.font.bodySmall
              font.bold: true
            }

            MouseArea {
              anchors.fill: parent
              hoverEnabled: true
              cursorShape: Qt.PointingHandCursor
              onClicked: root.howToExpanded = !root.howToExpanded
            }
          }

          Column {
            width: parent.width
            spacing: Style.space(6)
            visible: root.howToExpanded

            Repeater {
              model: Model.HOW_TO_PLAY.steps

              Text {
                required property int index
                required property string modelData
                width: parent.width
                text: (index + 1) + ". " + modelData
                color: root.dim
                font.family: root.fontFamily
                font.pixelSize: Style.font.caption
                wrapMode: Text.WordWrap
              }
            }

            Text {
              width: parent.width
              text: Model.HOW_TO_PLAY.scoringIntro
              color: root.dim
              font.family: root.fontFamily
              font.pixelSize: Style.font.caption
              wrapMode: Text.WordWrap
            }

            Repeater {
              model: Model.scoringRows()

              Item {
                id: scoreRow
                required property var modelData
                width: parent.width
                implicitHeight: scoreBand.implicitHeight

                Text {
                  id: scoreBand
                  anchors.left: parent.left
                  text: scoreRow.modelData.band
                  color: root.bandColor(scoreRow.modelData.band)
                  font.family: root.fontFamily
                  font.pixelSize: Style.font.caption
                  font.bold: true
                }

                Text {
                  anchors.left: scoreBand.right
                  anchors.leftMargin: Style.space(8)
                  anchors.baseline: scoreBand.baseline
                  text: scoreRow.modelData.meaning
                  color: root.dim
                  font.family: root.fontFamily
                  font.pixelSize: Style.font.caption
                }

                Text {
                  anchors.right: parent.right
                  anchors.baseline: scoreBand.baseline
                  text: qsTr("%1 pts").arg(scoreRow.modelData.points)
                  color: root.dim
                  font.family: root.fontFamily
                  font.pixelSize: Style.font.caption
                }
              }
            }

            Repeater {
              model: [
                Model.HOW_TO_PLAY.streakNote,
                Model.HOW_TO_PLAY.hintNote,
                Model.HOW_TO_PLAY.statsNote
              ]

              Text {
                required property string modelData
                width: parent.width
                text: modelData
                color: root.dim
                font.family: root.fontFamily
                font.pixelSize: Style.font.caption
                wrapMode: Text.WordWrap
              }
            }
          }
        }

        // --- History: a horizontal strip ---
        //
        // Scrolls sideways rather than growing a list downwards. The popup is
        // already tall with the result, the guide and the stats panel, and a
        // vertical history would push it past the screen after a few weeks.
        // A fixed-height strip costs the same whether there are three days in
        // it or three hundred.
        Column {
          width: parent.width
          spacing: Style.space(8)
          visible: root.historyDays.length > 0

          Rectangle {
            width: parent.width
            height: 1
            color: root.dim
            opacity: 0.3
          }

          Item {
            width: parent.width
            implicitHeight: historyToggle.implicitHeight

            Text {
              id: historyToggle
              anchors.left: parent.left
              text: (root.historyExpanded ? "▾ " : "▸ ") + qsTr("History")
              color: root.foreground
              font.family: root.fontFamily
              font.pixelSize: Style.font.bodySmall
              font.bold: true
            }

            Text {
              anchors.right: parent.right
              anchors.baseline: historyToggle.baseline
              text: root.historyDays.length === 1
                ? qsTr("1 day")
                : qsTr("%1 days").arg(root.historyDays.length)
              color: root.dim
              font.family: root.fontFamily
              font.pixelSize: Style.font.caption
            }

            MouseArea {
              anchors.fill: parent
              hoverEnabled: true
              cursorShape: Qt.PointingHandCursor
              onClicked: root.historyExpanded = !root.historyExpanded
            }
          }

          ListView {
            id: historyStrip
            visible: root.historyExpanded
            width: parent.width
            height: 96
            orientation: ListView.Horizontal
            spacing: Style.space(6)
            clip: true
            // Newest first, so the strip opens on the most recent day.
            model: root.historyDays
            boundsBehavior: Flickable.StopAtBounds

            // A vertical wheel is what a mouse actually produces over this
            // strip, so map it onto the horizontal axis rather than ignoring it.
            WheelHandler {
              target: null
              onWheel: function (event) {
                var delta = event.angleDelta.y !== 0 ? event.angleDelta.y : event.angleDelta.x
                historyStrip.contentX = Math.max(
                  0,
                  Math.min(
                    historyStrip.contentWidth - historyStrip.width,
                    historyStrip.contentX - delta
                  )
                )
              }
            }

            delegate: Rectangle {
              id: historyCard
              required property var modelData

              width: 118
              height: historyStrip.height
              radius: Style.cornerRadius
              color: Qt.rgba(root.foreground.r, root.foreground.g, root.foreground.b, 0.05)
              border.width: 1
              border.color: Qt.rgba(root.dim.r, root.dim.g, root.dim.b, 0.35)

              Column {
                anchors.fill: parent
                anchors.margins: Style.space(7)
                spacing: Style.space(3)

                Text {
                  width: parent.width
                  text: Model.formatDay(historyCard.modelData.day)
                  color: root.dim
                  font.family: root.fontFamily
                  font.pixelSize: Style.font.caption
                  elide: Text.ElideRight
                }

                Text {
                  width: parent.width
                  text: historyCard.modelData.entry.band +
                        (historyCard.modelData.entry.assisted ? " ·" : "")
                  color: root.bandColor(historyCard.modelData.entry.band)
                  font.family: root.fontFamily
                  font.pixelSize: Style.font.caption
                  font.bold: true
                  elide: Text.ElideRight
                }

                Text {
                  width: parent.width
                  text: Model.formatCompact(historyCard.modelData.entry.guess)
                  color: root.foreground
                  font.family: root.fontFamily
                  font.pixelSize: Style.font.caption
                  elide: Text.ElideRight
                }

                Text {
                  width: parent.width
                  text: "→ " + (historyCard.modelData.entry.answerValue !== undefined
                    ? Model.formatCompact(historyCard.modelData.entry.answerValue)
                    : "?")
                  color: root.dim
                  font.family: root.fontFamily
                  font.pixelSize: Style.font.caption
                  elide: Text.ElideRight
                }

                Text {
                  width: parent.width
                  text: historyCard.modelData.entry.distanceDecades !== null &&
                        historyCard.modelData.entry.distanceDecades !== undefined
                    ? qsTr("%1 dec").arg(historyCard.modelData.entry.distanceDecades.toFixed(2))
                    : ""
                  color: root.dim
                  font.family: root.fontFamily
                  font.pixelSize: Style.font.caption
                  elide: Text.ElideRight
                }
              }
            }
          }
        }

        // --- Lifetime stats, collapsed by default so the daily flow stays short ---
        Column {
          width: parent.width
          spacing: Style.space(8)
          visible: root.stats.played > 0

          Rectangle {
            width: parent.width
            height: 1
            color: root.dim
            opacity: 0.3
          }

          Item {
            width: parent.width
            implicitHeight: statsToggle.implicitHeight

            Text {
              id: statsToggle
              anchors.left: parent.left
              text: (root.statsExpanded ? "▾ " : "▸ ") + qsTr("Stats")
              color: root.foreground
              font.family: root.fontFamily
              font.pixelSize: Style.font.bodySmall
              font.bold: true
            }

            Text {
              anchors.right: parent.right
              anchors.baseline: statsToggle.baseline
              text: qsTr("%1 played · %2 pts")
                .arg(root.stats.played)
                .arg(Model.formatCompact(root.stats.totalPoints))
              color: root.dim
              font.family: root.fontFamily
              font.pixelSize: Style.font.caption
            }

            MouseArea {
              anchors.fill: parent
              hoverEnabled: true
              cursorShape: Qt.PointingHandCursor
              onClicked: root.statsExpanded = !root.statsExpanded
            }
          }

          Column {
            id: statsBody
            width: parent.width
            spacing: Style.space(5)
            visible: root.statsExpanded

            Repeater {
              model: Model.BANDS

              Item {
                id: bandRow

                readonly property string band: modelData
                readonly property int tally: root.stats.counts[band] || 0

                width: statsBody.width
                implicitHeight: Style.space(14)

                Text {
                  id: bandName
                  anchors.left: parent.left
                  anchors.verticalCenter: parent.verticalCenter
                  width: Style.space(58)
                  text: bandRow.band
                  color: root.dim
                  font.family: root.fontFamily
                  font.pixelSize: Style.font.caption
                }

                Text {
                  id: bandTally
                  anchors.right: parent.right
                  anchors.verticalCenter: parent.verticalCenter
                  text: bandRow.tally
                  color: root.dim
                  font.family: root.fontFamily
                  font.pixelSize: Style.font.caption
                }

                Rectangle {
                  anchors.left: bandName.right
                  anchors.right: bandTally.left
                  anchors.rightMargin: Style.space(8)
                  anchors.verticalCenter: parent.verticalCenter
                  height: Style.space(6)
                  radius: height / 2
                  color: Qt.rgba(root.foreground.r, root.foreground.g, root.foreground.b, 0.14)

                  Rectangle {
                    anchors.left: parent.left
                    anchors.top: parent.top
                    anchors.bottom: parent.bottom
                    width: parent.width * (root.stats.played > 0 ? bandRow.tally / root.stats.played : 0)
                    radius: parent.radius
                    color: root.bandColor(bandRow.band)
                  }
                }
              }
            }

            Text {
              width: parent.width
              text: qsTr("Best streak %1 · median %2 decades off")
                .arg(root.stats.bestStreak)
                .arg(root.stats.medianDecades !== null ? root.stats.medianDecades.toFixed(2) : "–")
              color: root.dim
              font.family: root.fontFamily
              font.pixelSize: Style.font.caption
              wrapMode: Text.WordWrap
            }

            // Which way you lean, once there are enough days for it to mean
            // something. Blank until then rather than reporting noise.
            Text {
              width: parent.width
              visible: text !== ""
              text: Model.calibrationLabel(root.stats) || ""
              color: root.foreground
              font.family: root.fontFamily
              font.pixelSize: Style.font.caption
              wrapMode: Text.WordWrap
            }
          }
        }
      }
    }
  }
}
