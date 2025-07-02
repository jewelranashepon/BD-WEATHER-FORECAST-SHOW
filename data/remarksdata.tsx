interface Remark {
  symbol: string;
  description: string;
}

const remarksData: Record<string, Remark> = {
  "00": {
    symbol: "remarks/1.png",
    description:
      "Cloud development not observed or not observable during past hour",
  },
  "01": {
    symbol: "/remarks/2.png",
    description:
      "Clouds generally dissolving or becoming less developed during past hour",
  },
  "02": {
    symbol: "/remarks/3.png",
    description: "State of sky on the whole unchanged during past hour",
  },
  "03": {
    symbol: "/remarks/4.png",
    description: "Clouds generally forming or developing during past hour",
  },
  "04": {
    symbol: "/remarks/5.png",
    description: "Visibility reduced by smoke",
  },
  "05": {
    symbol: "/remarks/6.png",
    description: "Haze",
  },
  "06": {
    symbol: "/remarks/7.png",
    description:
      "Widespread dust in suspension in the air, not raised by wind at time of observation",
  },
  "07": {
    symbol: "/remarks/8.png",
    description: "Dust or sand raised by wind at time of observation",
  },
  "08": {
    symbol: "/remarks/9.png",
    description: "Well developed dust devil(s) within past hour",
  },
  "09": {
    symbol: "/remarks/10.png",
    description:
      "Duststorm or sandstorm within sight of station or at station during past hour",
  },
  "10": {
    symbol: "/remarks/11.png",
    description: "Light fog (BR)",
  },
  "11": {
    symbol: "/remarks/12.png",
    description:
      "Patches of shallow fog at station not deeper than 6 feet on land",
  },
  "12": {
    symbol: "/remarks/13.png",
    description:
      "More or less continuous shallow fog at station not deeper than 6 feet on land (MIFG)",
  },
  "13": {
    symbol: "/remarks/14.png",
    description: "Lightning visible, no thunder heard (VCTS)",
  },
  "14": {
    symbol: "/remarks/15.png",
    description:
      "Precipitation within sight, but not reaching the ground (VIRGA)",
  },
  "15": {
    symbol: "/remarks/16.png",
    description:
      "Precipitation within sight, reaching ground, but distant from station",
  },
  "16": {
    symbol: "/remarks/17.png",
    description:
      "Precipitation within sight, reaching the ground, near to but not at station (VCSH)",
  },
  "17": {
    symbol: "/remarks/18.png",
    description: "Thunder heard but no precipitation at the station",
  },
  "18": {
    symbol: "/remarks/19.png",
    description: "Squall(s) within sight during past hour (SQ)",
  },
  "19": {
    symbol: "/remarks/20.png",
    description: "Funnel cloud(s) within sight during past hour (FU/+FC)",
  },
  "20": {
    symbol: "/remarks/21.png",
    description:
      "Drizzle (not freezing, not showers) during past hour, not at time of obs",
  },
  "21": {
    symbol: "/remarks/22.png",
    description:
      "Rain (not freezing, not showers) during past hour, not at time of obs",
  },
  "22": {
    symbol: "/remarks/23.png",
    description:
      "Snow (not falling as showers) during past hour, not at time of obs",
  },
  "23": {
    symbol: "/remarks/24.png",
    description:
      "Rain and snow (not showers) during past hour, not at time of obs",
  },
  "24": {
    symbol: "/remarks/25.png",
    description:
      "Freezing drizzle or rain (not showers) during past hour, not at time of obs",
  },
  "25": {
    symbol: "/remarks/26.png",
    description: "Showers of rain during past hour, but not at time of obs",
  },
  "26": {
    symbol: "/remarks/27.png",
    description:
      "Showers of snow, or of rain and snow during past hour, but not at time of obs",
  },
  "27": {
    symbol: "/remarks/28.png",
    description:
      "Showers of hail, or of hail and rain during past hour, but not at time of obs",
  },
  "28": {
    symbol: "/remarks/29.png",
    description: "Fog during past hour, but not at time of obs",
  },
  "29": {
    symbol: "/remarks/30.png",
    description:
      "Thunderstorm (with or without precip) during past hour, but not at time of obs",
  },
  "30": {
    symbol: "/remarks/31.png",
    description:
      "Slight or moderate duststorm or sandstorm, has decreased during past hour",
  },
  "31": {
    symbol: "/remarks/32.png",
    description:
      "Slight or moderate duststorm or sandstorm, no appreciable change during past hour",
  },
  "32": {
    symbol: "/remarks/33.png",
    description:
      "Slight or moderate duststorm or sandstorm, has increased during past hour",
  },
  "33": {
    symbol: "/remarks/34.png",
    description:
      "Severe duststorm or sandstorm, has decreased during past hour",
  },
  "34": {
    symbol: "/remarks/35.png",
    description:
      "Severe duststorm or sandstorm, no appreciable change during past hour",
  },
  "35": {
    symbol: "/remarks/36.png",
    description:
      "Severe duststorm or sandstorm, has increased during past hour",
  },
  "36": {
    symbol: "/remarks/37.png",
    description: "Slight or moderate drifting snow, generally low",
  },
  "37": {
    symbol: "/remarks/38.png",
    description: "Heavy drifting snow, generally low",
  },
  "38": {
    symbol: "/remarks/39.png",
    description: "Slight or moderate drifting snow, generally high",
  },
  "39": {
    symbol: "/remarks/40.png",
    description: "Heavy drifting snow, generally high",
  },

  "40": {
    symbol: "/remarks/41.png",
    description:
      "Fog at distance at time of obs but not at station during past hour (VCFG)",
  },
  "41": { symbol: "/remarks/42.png", description: "Fog in patches (BCFG)" },
  "42": {
    symbol: "/remarks/43.png",
    description:
      "Fog, sky discernable, has become thinner during past hour (PRFG)",
  },
  "43": {
    symbol: "/remarks/44.png",
    description:
      "Fog, sky not discernable, has become thinner during past hour",
  },
  "44": {
    symbol: "/remarks/45.png",
    description: "Fog, sky discernable, no appreciable change during past hour",
  },
  "45": {
    symbol: "/remarks/46.png",
    description:
      "Fog, sky not discernable, no appreciable change during past hour (FG)",
  },
  "46": {
    symbol: "/remarks/47.png",
    description:
      "Fog, sky discernable, has begun or become thicker during past hour",
  },
  "47": {
    symbol: "/remarks/48.png",
    description:
      "Fog, sky not discernable, has begun or become thicker during past hour",
  },
  "48": {
    symbol: "/remarks/49.png",
    description: "Fog, depositing rime, sky discernable",
  },
  "49": {
    symbol: "/remarks/50.png",
    description: "Fog, depositing rime, sky not discernable (FZFG)",
  },

  "50": {
    symbol: "/remarks/51.png",
    description: "Intermittent drizzle (not freezing), slight at time of obs",
  },
  "51": {
    symbol: "/remarks/52.png",
    description:
      "Continuous drizzle (not freezing), slight at time of obs (-DZ)",
  },
  "52": {
    symbol: "/remarks/53.png",
    description: "Intermittent drizzle (not freezing), moderate at time of obs",
  },
  "53": {
    symbol: "/remarks/54.png",
    description:
      "Continuous drizzle (not freezing), moderate at time of obs (DZ)",
  },
  "54": {
    symbol: "/remarks/55.png",
    description: "Intermittent drizzle (not freezing), thick at time of obs",
  },
  "55": {
    symbol: "/remarks/56.png",
    description:
      "Continuous drizzle (not freezing), thick at time of obs (+DZ)",
  },
  "56": {
    symbol: "/remarks/57.png",
    description: "Slight freezing drizzle (-FZDZ)",
  },
  "57": {
    symbol: "/remarks/58.png",
    description: "Moderate or thick freezing drizzle (FZDZ)",
  },
  "58": {
    symbol: "/remarks/59.png",
    description:
      "Drizzle and rain, slight or moderate (-DZRA; -DZ RA; -DZR -RA)",
  },
  "59": {
    symbol: "/remarks/60.png",
    description:
      "Drizzle and rain, moderate or heavy (DZRA; +DZRA; DZ +RA; DZRA)",
  },
  "60": {
    symbol: "/remarks/61.png",
    description: "Intermittent rain (not freezing), slight at time of obs",
  },
  "61": {
    symbol: "/remarks/62.png",
    description: "Continuous rain (not freezing), slight at time of obs (-RA)",
  },
  "62": {
    symbol: "/remarks/63.png",
    description: "Intermittent rain (not freezing), moderate at time of obs",
  },
  "63": {
    symbol: "/remarks/64.png",
    description: "Continuous rain (not freezing), moderate at time of obs (RA)",
  },
  "64": {
    symbol: "/remarks/65.png",
    description: "Intermittent rain (not freezing), heavy at time of obs",
  },
  "65": {
    symbol: "/remarks/66.png",
    description: "Continuous rain (not freezing), heavy at time of obs (+RA)",
  },
  "66": {
    symbol: "/remarks/67.png",
    description: "Slight freezing rain (-FZRA)",
  },
  "67": {
    symbol: "/remarks/68.png",
    description: "Moderate or heavy freezing rain (FZRA)",
  },
  "68": {
    symbol: "/remarks/69.png",
    description:
      "Rain or drizzle and snow, slight (-RN -SN; -RA SN; -DZ SN; RA -SN; DZ -SN)",
  },
  "69": {
    symbol: "/remarks/70.png",
    description:
      "Rain or drizzle and snow, moderate or heavy (RA SN; DZ SN; RA +SN; +RA SN; +DZ SN)",
  },
  "70": {
    symbol: "/remarks/71.png",
    description:
      "Intermittent fall of snowflakes, slight or moderate at time of obs",
  },
  "71": {
    symbol: "/remarks/72.png",
    description: "Continuous fall of snowflakes, slight at time of obs",
  },
  "72": {
    symbol: "/remarks/73.png",
    description: "Intermittent fall of snowflakes, moderate at time of obs",
  },
  "73": {
    symbol: "/remarks/74.png",
    description: "Continuous fall of snowflakes, moderate at time of obs",
  },
  "74": {
    symbol: "/remarks/75.png",
    description: "Intermittent fall of snowflakes, heavy at time of obs",
  },
  "75": {
    symbol: "/remarks/76.png",
    description: "Continuous fall of snowflakes, heavy at time of obs",
  },
  "76": {
    symbol: "/remarks/77.png",
    description: "Ice pellets, with or without rain at time of obs",
  },
  "77": {
    symbol: "/remarks/78.png",
    description: "Snow grains or snow crystals with or without rain",
  },
  "78": {
    symbol: "/remarks/79.png",
    description: "Slight shower(s) of snow or small hail",
  },
  "79": {
    symbol: "/remarks/80.png",
    description: "Moderate or heavy shower(s) of snow or small hail",
  },
  "80": { symbol: "/remarks/81.png", description: "Slight rain shower(s)" },
  "81": {
    symbol: "/remarks/82.png",
    description: "Moderate or heavy rain shower(s)",
  },
  "82": { symbol: "/remarks/83.png", description: "Violent rain shower(s)" },
  "83": {
    symbol: "/remarks/84.png",
    description: "Slight shower(s) of rain and snow mixed",
  },
  "84": {
    symbol: "/remarks/85.png",
    description: "Moderate or heavy shower(s) of rain and snow",
  },
  "85": { symbol: "/remarks/86.png", description: "Slight snow shower(s)" },
  "86": {
    symbol: "/remarks/87.png",
    description: "Moderate or heavy snow shower(s)",
  },
  "87": {
    symbol: "/remarks/88.png",
    description: "Slight shower(s) of snow or small hail with or without rain",
  },
  "88": {
    symbol: "/remarks/89.png",
    description: "Moderate or heavy shower(s) of snow or small hail",
  },
  "89": {
    symbol: "/remarks/90.png",
    description: "Slight shower(s) of ice pellets, sleet, or hail",
  },
  "90": {
    symbol: "/remarks/91.png",
    description: "Thunderstorm without precipitation at time of obs",
  },
  "91": {
    symbol: "/remarks/92.png",
    description: "Thunderstorm with rain at time of obs",
  },
  "92": {
    symbol: "/remarks/93.png",
    description: "Thunderstorm with hail at time of obs",
  },
  "93": {
    symbol: "/remarks/94.png",
    description: "Slight thunderstorm with rain at time of obs",
  },
  "94": {
    symbol: "/remarks/95.png",
    description: "Moderate or heavy thunderstorm with rain at time of obs",
  },
  "95": {
    symbol: "/remarks/96.png",
    description: "Heavy thunderstorm with hail at time of obs",
  },
  "96": {
    symbol: "/remarks/97.png",
    description:
      "Slight or moderate thunderstorm with rain or hail but not at time of obs",
  },
  "97": {
    symbol: "/remarks/98.png",
    description:
      "Moderate or heavy thunderstorm with rain and hail, but not at time of obs",
  },
  "98": {
    symbol: "/remarks/99.png",
    description: "Thunderstorm with rain and strong wind at time of obs",
  },
  "99": {
    symbol: "/remarks/99.png",
    description: "Heavy thunderstorm with hail, not at time of obs",
  },
};
export default remarksData;
