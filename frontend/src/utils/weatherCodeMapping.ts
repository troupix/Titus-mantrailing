
interface WeatherInfo {
  description: string;
  image: string;
}

const weatherCodes: Record<string, WeatherInfo> = {
    "0": {
        "description": "Ensoleillé",
        "image": "/weather/0_Sunny.png"
    },
    "1": {
        "description": "Principalement ensoleillé",
        "image": "/weather/1_Mainly_Sunny.png"
    },
    "2": {
        "description": "Partiellement nuageux",
        "image": "/weather/2_Partly_Cloudy.png"
    },
    "3": {
        "description": "Nuageux",
        "image": "/weather/3_Cloudy.png"
    },
    "45": {
        "description": "Brouillard",
        "image": "/weather/45_Foggy.png"
    },
    "48": {
        "description": "Brouillard givrant",
        "image": "/weather/48_Rime_Fog.png"
    },
    "51": {
        "description": "Bruine légère",
        "image": "/weather/51_Light_Drizzle.png"
    },
    "53": {
        "description": "Bruine",
        "image": "/weather/53_Drizzle.png"
    },
    "55": {
        "description": "Forte bruine",
        "image": "/weather/55_Heavy_Drizzle.png"
    },
    "56": {
        "description": "Légère bruine verglaçante",
        "image": "/weather/56_Light_Freezing_Drizzle.png"
    },
    "57": {
        "description": "Bruine verglaçante",
        "image": "/weather/57_Freezing_Drizzle.png"
    },
    "61": {
        "description": "Pluie légère",
        "image": "/weather/61_Light_Rain.png"
    },
    "63": {
        "description": "Pluie",
        "image": "/weather/63_Rain.png"
    },
    "65": {
        "description": "Pluie forte",
        "image": "/weather/65_Heavy_Rain.png"
    },
    "66": {
        "description": "Pluie verglaçante légère",
        "image": "/weather/66_Light_Freezing_Rain.png"
    },
    "67": {
        "description": "Pluie verglaçante",
        "image": "/weather/67_Freezing_Rain.png"
    },
    "71": {
        "description": "Neige légère",
        "image": "/weather/71_Light_Snow.png"
    },
    "73": {
        "description": "Neige",
        "image": "/weather/73_Snow.png"
    },
    "75": {
        "description": "Neige forte",
        "image": "/weather/75_Heavy_Snow.png"
    },
    "77": {
        "description": "Grains de neige",
        "image": "/weather/77_Snow_Grains.png"
    },
    "80": {
        "description": "Averses légères",
        "image": "/weather/80_Light_Showers.png"
    },
    "81": {
        "description": "Averses",
        "image": "/weather/81_Showers.png"
    },
    "82": {
        "description": "Averses fortes",
        "image": "/weather/82_Heavy_Showers.png"
    },
    "85": {
        "description": "Averses de neige légères",
        "image": "/weather/85_Light_Snow_Showers.png"
    },
    "86": {
        "description": "Averses de neige",
        "image": "/weather/86_Snow_Showers.png"
    },
    "95": {
        "description": "Orage",
        "image": "/weather/95_Thunderstorm.png"
    },
    "96": {
        "description": "Orages légers avec grêle",
        "image": "/weather/96_Light_Thunderstorms_With_Hail.png"
    },
    "99": {
        "description": "Orage avec grêle",
        "image": "/weather/99_Thunderstorm_With_Hail.png"
    }
};

export const getWeatherInfo = (code: string): WeatherInfo | undefined => {
  return weatherCodes[code];
};
