const getWeather = async (lon, lat, date, hour = 12) => {
  const { fetchWeatherApi } = await import('openmeteo');
  const params = {
    "latitude": lat,
    "longitude": lon,
    "start_date": date,
    "end_date": date,
    "hourly": ["temperature_2m", "precipitation", "weather_code", "wind_speed_10m", "wind_direction_10m", "relative_humidity_2m"],
  };
  const url = "https://historical-forecast-api.open-meteo.com/v1/forecast";
  const responses = await fetchWeatherApi(url, params);

  // Process first location. Add a for-loop for multiple locations or weather models
  const response = responses[0];

  const hourly = response.hourly();

  // Note: The order of weather variables in the URL query and the indices below need to match!
  const weatherData = {
    temperature: hourly.variables(0).valuesArray()[hour],
    conditions: hourly.variables(2).valuesArray()[hour], // weather_code
    windSpeed: hourly.variables(3).valuesArray()[hour],
    windDirection: hourly.variables(4).valuesArray()[hour],
    humidity: hourly.variables(5).valuesArray()[hour],
    precipitation: hourly.variables(1).valuesArray()[hour],
  };

  return weatherData;
};

module.exports = {
  getWeather,
};