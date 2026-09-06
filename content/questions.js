var QUESTIONS = [
  {
    "id": "piano-tuners-chicago",
    "prompt": "How many professional piano tuners work in the Chicago metro area?",
    "unit": "piano tuners",
    "answerValue": 100,
    "decompositionHint": "Metro population (~9.5M) \u2192 households with a piano (~1 in 20) \u2192 pianos tuned about once a year \u2192 a full-time tuner can do ~4 tunings/day, ~250 working days/year (~1000/year). Divide pianos-needing-tuning by tunings-per-tuner-per-year.",
    "source": "Classic Fermi problem (originally posed by Enrico Fermi); widely accepted estimate range 50-200"
  },
  {
    "id": "golf-balls-school-bus",
    "prompt": "How many standard golf balls would fit inside an empty school bus?",
    "unit": "golf balls",
    "answerValue": 500000,
    "decompositionHint": "Estimate the bus's interior volume (~cuboid, roughly 8m x 2.5m x 2m \u2248 40 m\u00b3), a golf ball's volume (~40 mL, diameter ~4.3cm), account for ~74% packing efficiency for spheres, then divide.",
    "source": "Classic interview-style Fermi problem; order-of-magnitude estimate"
  },
  {
    "id": "hairs-on-human-head",
    "prompt": "How many hairs are on an average adult human head?",
    "unit": "hairs",
    "answerValue": 100000,
    "decompositionHint": "Estimate scalp area (~600 cm\u00b2) and hair density (~150-200 hairs per cm\u00b2), then multiply.",
    "source": "Dermatology references; typical range 80,000-120,000"
  },
  {
    "id": "cells-in-human-body",
    "prompt": "Roughly how many cells are in the adult human body?",
    "unit": "cells",
    "answerValue": 37000000000000.0,
    "decompositionHint": "Estimate body mass (~70kg), average cell mass, and that most of the count comes from small, numerous cells like red blood cells and other blood/tissue cells.",
    "source": "Bianconi et al. 2013, Annals of Human Biology - widely cited estimate ~3.72\u00d710^13"
  },
  {
    "id": "grains-of-sand-beach",
    "prompt": "How many grains of sand are on a typical 1km-long, 30m-wide beach (down to 1m depth)?",
    "unit": "grains of sand",
    "answerValue": 2500000000000000.0,
    "decompositionHint": "Compute beach volume (length x width x depth), estimate a sand grain's volume (~0.5mm cube), then divide, accounting for packing.",
    "source": "Order-of-magnitude estimate using typical sand grain size ~0.5mm"
  },
  {
    "id": "stars-in-milky-way",
    "prompt": "Approximately how many stars are in the Milky Way galaxy?",
    "unit": "stars",
    "answerValue": 200000000000.0,
    "decompositionHint": "Use the galaxy's estimated total mass and the average stellar mass to back out a star count, or recall published astronomical estimates.",
    "source": "NASA/ESA estimates typically cite 100-400 billion stars"
  },
  {
    "id": "trees-on-earth",
    "prompt": "Approximately how many trees are there on Earth?",
    "unit": "trees",
    "answerValue": 3000000000000.0,
    "decompositionHint": "Estimate global forest area and average tree density per hectare, then multiply.",
    "source": "Crowther et al. 2015, Nature - estimated ~3.04 trillion trees"
  },
  {
    "id": "water-drops-in-swimming-pool",
    "prompt": "How many drops of water would it take to fill an Olympic swimming pool (2,500 m\u00b3)?",
    "unit": "drops",
    "answerValue": 50000000000.0,
    "decompositionHint": "A typical water drop is about 0.05 mL. Convert the pool's volume to milliliters and divide by drop volume.",
    "source": "Olympic pool standard volume 2,500,000 L; typical drop ~0.05mL"
  },
  {
    "id": "words-spoken-lifetime",
    "prompt": "How many words does an average person speak in their lifetime?",
    "unit": "words",
    "answerValue": 860000000.0,
    "decompositionHint": "Estimate average words spoken per day (~16,000), multiply by days in an ~80 year lifespan, adjusting for years before speech develops.",
    "source": "Mehl et al. 2007, Science - average ~16,000 words/day"
  },
  {
    "id": "heartbeats-lifetime",
    "prompt": "How many times does an average human heart beat over a full lifetime (~80 years)?",
    "unit": "heartbeats",
    "answerValue": 3000000000.0,
    "decompositionHint": "Average resting heart rate ~70-75 bpm. Multiply beats/minute by minutes/year by 80 years.",
    "source": "Standard physiology figures; commonly cited ~2.5-3 billion beats"
  },
  {
    "id": "bricks-empire-state",
    "prompt": "Roughly how many bricks would it take to build a structure the size of the Empire State Building (if built entirely of brick)?",
    "unit": "bricks",
    "answerValue": 10000000.0,
    "decompositionHint": "Estimate the building's total exterior wall surface area and typical wall thickness, a standard brick's volume, and divide.",
    "source": "Order-of-magnitude estimate based on building volume ~37 million cubic feet"
  },
  {
    "id": "cars-in-us",
    "prompt": "How many registered passenger cars are there in the United States?",
    "unit": "cars",
    "answerValue": 280000000.0,
    "decompositionHint": "US population (~335M) x average vehicles per person (~0.8), or recall it's roughly 1 vehicle for every 1.2 people.",
    "source": "US Dept. of Transportation / Bureau of Transportation Statistics, ~280 million registered vehicles"
  },
  {
    "id": "smartphones-in-world",
    "prompt": "How many smartphones are actively in use worldwide?",
    "unit": "smartphones",
    "answerValue": 6900000000.0,
    "decompositionHint": "World population (~8B) x smartphone penetration rate (~85% of adults in many regions, lower in others, roughly ~86% overall).",
    "source": "GSMA / Statista estimates, ~6.9 billion smartphone users worldwide (2024-2025)"
  },
  {
    "id": "gallons-water-us-daily",
    "prompt": "How many gallons of water does the average US household use per day?",
    "unit": "gallons/day",
    "answerValue": 300,
    "decompositionHint": "Estimate per-person daily use (~80-100 gallons: showers, toilets, laundry, dishes) times average household size (~2.5 people).",
    "source": "US EPA WaterSense program estimates"
  },
  {
    "id": "pizza-slices-consumed-us-daily",
    "prompt": "How many slices of pizza are eaten in the United States per day?",
    "unit": "pizza slices",
    "answerValue": 100000000.0,
    "decompositionHint": "US population (~335M), estimate fraction eating pizza on a given day (~13% per commonly cited industry figures) x average slices per person (~2-3).",
    "source": "Often-cited pizza industry statistic: ~100 million slices/day"
  },
  {
    "id": "leaves-on-oak-tree",
    "prompt": "How many leaves are on a mature oak tree?",
    "unit": "leaves",
    "answerValue": 200000,
    "decompositionHint": "Estimate canopy volume or number of branches x leaves per branch, or use published estimates for a mature tree's leaf count.",
    "source": "Botanical estimates for mature oaks, typically 100,000-250,000 leaves"
  },
  {
    "id": "atoms-in-grain-of-salt",
    "prompt": "Approximately how many atoms are in a single grain of table salt (NaCl)?",
    "unit": "atoms",
    "answerValue": 1.2e+18,
    "decompositionHint": "Estimate the grain's volume (~0.3mm cube), use NaCl's density (~2.16 g/cm\u00b3) to get mass, convert to moles via molar mass (58.44 g/mol), multiply by Avogadro's number, then by 2 (for Na and Cl atoms).",
    "source": "Standard chemistry calculation using Avogadro's number 6.022\u00d710^23"
  },
  {
    "id": "breaths-per-lifetime",
    "prompt": "How many breaths does a person take over an 80-year lifetime?",
    "unit": "breaths",
    "answerValue": 670000000.0,
    "decompositionHint": "Average resting breathing rate ~12-16 breaths/minute. Multiply by minutes/year and years lived.",
    "source": "Standard respiratory physiology figures"
  },
  {
    "id": "libraries-of-congress-internet",
    "prompt": "How many 'Libraries of Congress' worth of data (~20 petabytes of text/print) is generated globally by internet traffic in one day?",
    "unit": "Libraries of Congress",
    "answerValue": 15000,
    "decompositionHint": "Global daily internet traffic is roughly 300+ exabytes (2024 estimates). Convert to petabytes and divide by ~20 PB.",
    "source": "Cisco/various internet traffic reports; Library of Congress print collection estimated at ~20TB-20PB depending on what's counted (text only vs. all formats)"
  },
  {
    "id": "bacteria-per-human-body",
    "prompt": "How many bacterial cells live in and on an average human body?",
    "unit": "bacterial cells",
    "answerValue": 38000000000000.0,
    "decompositionHint": "Recent research revised the old '10x more bacteria than human cells' claim - the actual ratio is close to 1:1. Use human cell count (~3.7\u00d710^13) as an anchor.",
    "source": "Sender, Fuchs, Milo 2016, PLOS Biology - revised bacteria:human cell ratio ~1.3:1"
  },
  {
    "id": "steps-across-us",
    "prompt": "How many walking steps would it take to cross the continental US (~4,500 km) coast to coast?",
    "unit": "steps",
    "answerValue": 6000000,
    "decompositionHint": "Average adult stride length is about 0.75m. Convert the distance to meters and divide by stride length.",
    "source": "Standard stride length figures (~0.7-0.8m)"
  },
  {
    "id": "planes-in-air-worldwide",
    "prompt": "At any given moment, how many commercial passenger planes are in the air worldwide?",
    "unit": "planes",
    "answerValue": 9000,
    "decompositionHint": "Global commercial fleet is ~25,000-30,000 aircraft; at peak times a large fraction are airborne simultaneously across time zones.",
    "source": "FlightAware/Flightradar24 peak concurrent flight estimates, ~9,000-20,000 depending on time of day"
  },
  {
    "id": "gold-total-mined",
    "prompt": "How much gold has ever been mined in human history, in metric tons?",
    "unit": "metric tons",
    "answerValue": 212000,
    "decompositionHint": "This is largely a recall-based estimate, but you can sanity check: if all mined gold were melted into a cube, it would only be about 22m on a side - gold is surprisingly rare relative to its cultural prominence.",
    "source": "World Gold Council estimates, ~212,000 tonnes as of recent surveys"
  },
  {
    "id": "words-in-average-novel",
    "prompt": "How many words are in an average full-length novel?",
    "unit": "words",
    "answerValue": 90000,
    "decompositionHint": "Estimate pages (~300) x words per page (~300 for typical prose formatting).",
    "source": "Standard publishing industry figures, typical novel 70,000-100,000 words"
  },
  {
    "id": "blood-vessels-length",
    "prompt": "If you laid out all the blood vessels in an adult human body end to end, how many kilometers long would they be?",
    "unit": "kilometers",
    "answerValue": 100000,
    "decompositionHint": "Most of the length comes from capillaries, which are extremely numerous and thin despite each being very short - the count of capillaries dominates over their individual length.",
    "source": "Commonly cited physiology estimate, ~60,000-100,000 km total"
  },
  {
    "id": "chickens-on-earth",
    "prompt": "How many live chickens are there on Earth at any given time?",
    "unit": "chickens",
    "answerValue": 26000000000.0,
    "decompositionHint": "World population (~8B) x average annual chicken meat + egg consumption per person, combined with typical chicken lifespan before slaughter (~6 weeks for broilers), gives a standing population estimate.",
    "source": "UN FAO livestock statistics, ~26 billion chickens (roughly 3x the human population)"
  },
  {
    "id": "gasoline-us-daily",
    "prompt": "How many gallons of gasoline does the US consume per day?",
    "unit": "gallons/day",
    "answerValue": 370000000.0,
    "decompositionHint": "US has ~280M registered vehicles, average ~25-30 miles driven/day per active vehicle isn't quite right - better: total annual gasoline consumption (~135 billion gallons/year) divided by 365.",
    "source": "US Energy Information Administration (EIA) data"
  },
  {
    "id": "distance-blood-cell-travels-per-day",
    "prompt": "How many kilometers does a single red blood cell travel through the circulatory system in one day?",
    "unit": "kilometers",
    "answerValue": 19,
    "decompositionHint": "The heart completes a full circulation roughly once per minute at rest. Estimate the average circuit length (~1000-1300 cm through the full vascular loop) and multiply by circuits per day.",
    "source": "Physiology estimate based on ~1 full circulation per minute"
  },
  {
    "id": "e-coli-bacteria-mass-doubling",
    "prompt": "If a single E. coli bacterium divided unchecked every 20 minutes, how many hours would it take for its descendants' total mass to exceed the mass of Earth?",
    "unit": "hours",
    "answerValue": 66,
    "decompositionHint": "Each doubling multiplies mass by 2. Figure out how many doublings are needed to go from one bacterium's mass (~1 picogram) to Earth's mass (~6\u00d710^24 kg), then multiply doublings by 20 minutes.",
    "source": "Classic exponential-growth Fermi/math problem"
  },
  {
    "id": "post-it-notes-stacked-to-moon",
    "prompt": "How many standard Post-it notes (0.1mm thick) would you need to stack to reach the Moon (384,400 km away)?",
    "unit": "Post-it notes",
    "answerValue": 3800000000000.0,
    "decompositionHint": "Convert the Earth-Moon distance to millimeters and divide by a single note's thickness.",
    "source": "Simple unit-conversion Fermi problem"
  },
  {
    "id": "credit-cards-us-total",
    "prompt": "How many active credit card accounts are there in the United States?",
    "unit": "credit card accounts",
    "answerValue": 680000000.0,
    "decompositionHint": "US adult population (~260M) x average number of credit cards per adult (~2.5-4, since many people hold multiple cards).",
    "source": "Federal Reserve / credit bureau (Experian) reports"
  },
  {
    "id": "keystrokes-programmer-lifetime",
    "prompt": "How many keystrokes might a professional software developer type over a 30-year career?",
    "unit": "keystrokes",
    "answerValue": 300000000.0,
    "decompositionHint": "Estimate typing hours/day at work (~4 active hours), typing speed in keystrokes/minute (~150 including code/comments/chat), workdays/year (~230), and years (30).",
    "source": "Order-of-magnitude estimate from typical office typing patterns"
  },
  {
    "id": "raindrops-in-thunderstorm",
    "prompt": "How many individual raindrops fall during a typical thunderstorm covering 100 km\u00b2 and dropping 25mm of rain?",
    "unit": "raindrops",
    "answerValue": 80000000000000.0,
    "decompositionHint": "Total rain volume = area x depth. A typical raindrop is about 4mm in diameter (~34 microliters). Divide total volume by single-drop volume.",
    "source": "Standard meteorology figures for raindrop size (2-5mm typical)"
  },
  {
    "id": "solar-energy-hitting-earth-per-hour",
    "prompt": "How does the solar energy hitting Earth in one hour compare to total global human energy consumption in one year? (express as a ratio, hours-of-sunlight-equivalent : 1 year)",
    "unit": "ratio (roughly X:1)",
    "answerValue": 1,
    "decompositionHint": "This is the famous 'more energy from the sun in an hour than humanity uses in a year' claim - the two quantities are roughly equal in order of magnitude (~5\u00d710^20 J vs ~6\u00d710^20 J), so the ratio is close to 1:1.",
    "source": "US Dept. of Energy solar energy figures; widely cited comparison, roughly accurate to within a factor of ~1"
  },
  {
    "id": "sheets-toilet-paper-lifetime",
    "prompt": "How many sheets of toilet paper does an average American use in a lifetime (~80 years)?",
    "unit": "sheets",
    "answerValue": 384000,
    "decompositionHint": "Average American uses roughly 3-4 rolls per week (~200 sheets/roll). Multiply weekly sheet use by weeks in 80 years.",
    "source": "Industry consumption estimates (~100+ rolls/person/year in the US)"
  },
  {
    "id": "ants-on-earth",
    "prompt": "Approximately how many individual ants are alive on Earth at any given time?",
    "unit": "ants",
    "answerValue": 2e+16,
    "decompositionHint": "This requires recalling a published biomass-based estimate - ant biomass roughly matches or exceeds human biomass despite ants being tiny, implying an enormous count.",
    "source": "Schultheiss et al. 2022, PNAS - estimated ~20 quadrillion (2\u00d710^16) ants globally"
  },
  {
    "id": "revolutions-earth-around-sun-human-history",
    "prompt": "How many times has Earth orbited the Sun since the first Homo sapiens appeared (~300,000 years ago)?",
    "unit": "orbits",
    "answerValue": 300000,
    "decompositionHint": "One orbit equals one year, so this reduces directly to the number of years elapsed - a reminder that not every Fermi problem needs heavy decomposition.",
    "source": "Paleoanthropological dating of earliest Homo sapiens fossils (~300,000 years, Jebel Irhoud find)"
  },
  {
    "id": "emails-sent-per-day-worldwide",
    "prompt": "How many emails are sent worldwide per day?",
    "unit": "emails",
    "answerValue": 360000000000.0,
    "decompositionHint": "Estimate number of email accounts (~4-5B users, several accounts each) x average emails sent per account per day (~15-30, weighted heavily by automated/business email).",
    "source": "Radicati Group email statistics reports"
  },
  {
    "id": "distance-dna-in-body-stretched",
    "prompt": "If you unwound all the DNA in a single human body and laid the strands end to end, how many times could that length span the distance from Earth to the Sun (~150 million km) round trip?",
    "unit": "round trips",
    "answerValue": 400,
    "decompositionHint": "Each cell's DNA is about 2m long, and the body has ~3.7\u00d710^13 cells. Multiply to get total DNA length, then divide by twice the Earth-Sun distance.",
    "source": "Combines cell count (Bianconi et al. 2013) with commonly cited ~2m of DNA per cell"
  }
]

if (typeof module !== "undefined") module.exports = QUESTIONS
