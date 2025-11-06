
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Thermometer, Wind, Droplets } from "lucide-react";
import { getWeatherInfo } from "../utils/weatherCodeMapping";

interface WeatherDetailsProps {
  weather: {
    temperature?: number;
    conditions?: string;
    windDirection?: string;
    windSpeed?: number;
    humidity?: number;
  };
}

export function WeatherDetails({ weather }: WeatherDetailsProps) {
  const weatherInfo = weather.conditions && getWeatherInfo(weather.conditions);

  return (
    <div className="mt-6">
      <Card className="border-2 border-blue-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardTitle className="text-blue-900">Météo</CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {weatherInfo && (
            <div className="flex items-center gap-3">
              <img src={weatherInfo.image} alt={weatherInfo.description} className="w-12 h-12" />
              <div>
                <p className="text-sm text-muted-foreground">Conditions</p>
                <p className="text-xl text-blue-900">{weatherInfo.description}</p>
              </div>
            </div>
          )}
          {weather.temperature !== undefined && (
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Thermometer className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Température</p>
                <p className="text-xl text-blue-900">{Math.round(weather.temperature)}°C</p>
              </div>
            </div>
          )}
          {weather.windSpeed !== undefined && (
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Wind className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vent</p>
                <p className="text-xl text-blue-900">{Math.round(weather.windSpeed)} km/h</p>
              </div>
              {weather.windDirection !== undefined && (
                <img src="/weather/compass.png" alt="Compass" className="w-8 h-8" style={{ transform: `rotate(${parseFloat(weather.windDirection)}deg)` }} />
              )}
            </div>
          )}
          {weather.humidity !== undefined && (
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Droplets className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Humidité</p>
                <p className="text-xl text-blue-900">{weather.humidity}%</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
