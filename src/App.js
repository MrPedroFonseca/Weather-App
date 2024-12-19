import React, { useState, useEffect, useCallback } from "react";
import styled, { ThemeProvider } from "styled-components";
import axios from "axios";
import WeatherInfo from "./Components/WeatherInfo.tsx";
import debounce from "lodash.debounce";

import {
  lightTheme,
  darkTheme,
  Spinner,
  ThemeSwitchButton,
  MeasurementSwitchButton,
} from "./Components/GlobalComponents.js";

const AppContainer = styled.div`
  text-align: center;
  background-color: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.text};
  min-height: 100vh;
  position: relative;
`;

const Header = styled.header`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 20px 0;
`;

const Title = styled.h1`
  font-size: ${(props) => (props.$isEmpty ? "3.5rem" : "2.5rem")};
  margin: ${(props) => (props.$isEmpty ? "40px 0" : "0")};
  text-align: center;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 20px;
`;

const SearchInput = styled.input`
  padding: 8px;
  font-size: 16px;
  border: 2px solid ${(props) => props.theme.colors.secondary};
  border-radius: 4px;
  border-color: ${(props) => props.theme.colors.main};
  outline: none;
  margin-right: 10px;
  width: 350px;

  &:focus {
    border-color: ${(props) => props.theme.colors.main};
  }
`;

const App = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [city, setCity] = useState("");
  const [forecastData, setForecastData] = useState(null);
  const [unit, setUnit] = useState("metric");
  const [loading, setLoading] = useState(false);

  const [weatherCelsius, setWeatherCelsius] = useState(null);
  const [weatherFahrenheit, setWeatherFahrenheit] = useState(null);

  const [temperatureArray, setTemperatureArray] = useState([]);

  const API_KEY = "2117c83d046acd958e0bf7c443061199";

  // changing the app theme
  const toggleTheme = () => setIsDarkTheme(!isDarkTheme);

  // handle unit change
  const toggleUnit = () => {
    const newUnit = unit === "metric" ? "imperial" : "metric";
    setUnit(newUnit);
  };

  // handle city change
  const handleCityChange = (event) => {
    setCity(event.target.value);
  };

  const handleSearch = useCallback(
    debounce(async () => {
      let coord = { lat: 0, lot: 0 };
      let currTemp = 0;
      if (city !== "") {
        setLoading(true);
        try {
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${API_KEY}`
          );

          coord = response.data;
          currTemp = response.data.main.temp;

          if (unit === "metric") {
            setWeatherCelsius(response.data);
            setWeatherFahrenheit(null);
          } else {
            setWeatherFahrenheit(response.data);
            setWeatherCelsius(null);
          }
        } catch (error) {
          console.error("Error fetching weather data:", error);
          setWeatherCelsius(null);
          setWeatherFahrenheit(null);
        }

        try {
          const forecastResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${coord.coord.lat}&lon=${coord.coord.lon}&units=${unit}&exclude=current,minutely,daily,alerts&appid=${API_KEY}`
          );

          // group the data by day
          const groupedData = groupByDay(forecastResponse.data.list, currTemp);
          setForecastData(groupedData);
        } catch (error) {
          console.error("Error fetching weather data:", error);
          setWeatherCelsius(null);
          setWeatherFahrenheit(null);
        }

        setLoading(false);
      }
    }, 500), // Add debounce delay (500ms)
    [city, unit]
  );

  // Function to group data by day and calculate min/max temperatures
  const groupByDay = (list, currTemp) => {
    const dailyTemps = {};

    const next24HoursTemps = []; // Array to store temperatures for the next 24 hours (data for the chart)

    const currentTimestamp = Date.now() / 1000; // Current timestamp in seconds

    list.forEach((item) => {
      const date = item.dt_txt.split(" ")[0]; // Extract the date part
      const temp = item.main.temp;
      const weatherCondition = item.weather[0].main; // Get the main weather condition (e.g., Clear, Rain, etc.) for the emoji...

      // getting data for the chart
      if (item.dt <= currentTimestamp + 27 * 3600) {
        // Check if the timestamp is within the next 24 hours
        next24HoursTemps.push({
          time: item.dt_txt, // Include the timestamp in a readable format
          temperature: temp,
        });
      }

      // if the day is not already in dailyTemps, initialize it
      if (!dailyTemps[date]) {
        dailyTemps[date] = {
          min: temp,
          max: temp,
          weatherConditions: [weatherCondition], // Initialize with the first weather condition for that day
        };
      } else {
        dailyTemps[date].min = Math.min(dailyTemps[date].min, temp);
        dailyTemps[date].max = Math.max(dailyTemps[date].max, temp);
        dailyTemps[date].weatherConditions.push(weatherCondition); // Add the new weather condition for that day
      }
    });

    // API only give data 3 in 3 hours 
    generateMissingTemperatures(next24HoursTemps, currTemp);

    // Todays Date
    const todayDate = new Date().toISOString().split("T")[0];

    // map the data to get the most repeated weather condition for each day
    return Object.entries(dailyTemps)
      .filter(([date]) => date !== todayDate) // Skip today's date
      .slice(0, 6) // Limit to the next 5 days
      .map(([date, { min, max, weatherConditions }]) => {
        // Find the most frequent weather condition
        const weatherCount = weatherConditions.reduce((acc, condition) => {
          acc[condition] = (acc[condition] || 0) + 1;
          return acc;
        }, {});

        // Get the most frequent condition
        const mostFrequentWeather = Object.entries(weatherCount).reduce(
          (max, entry) => (entry[1] > max[1] ? entry : max)
        )[0];

        return {
          date,
          min,
          max,
          weather: mostFrequentWeather, // Store the most frequent weather condition
        };
      });
  };

  const generateMissingTemperatures = (chartData, currTemp) => {
    const filledData = []; // Array to store the new chart data with missing hours filled

    const currentTime = new Date();
    currentTime.setMinutes(0, 0, 0); // Round current time to the current hour

    // Temperature from the wea

    // Parse the first data time in the input array
    const firstDataTime = new Date(chartData[0].time);

    // Check if the current time matches the first data time
    if (currentTime < firstDataTime) {
      // Add current time as the first entry
      filledData.push({
        time: currentTime.toISOString().replace("T", " ").slice(0, 19),
        temperature: currTemp.toFixed(2),
      });

      // Check the difference in hours
      const hoursDiff = (firstDataTime - currentTime) / (1000 * 60 * 60);
      if (hoursDiff === 2) {
        // Calculate the midpoint temperature (average)
        const midpointTime = new Date(currentTime);
        midpointTime.setHours(currentTime.getHours() + 1); // Add 1 hour

        const midpointTemp = (currTemp + chartData[0].temperature) / 2;

        // Add the midpoint value
        filledData.push({
          time: midpointTime.toISOString().replace("T", " ").slice(0, 19),
          temperature: midpointTemp.toFixed(2),
        });
      }
    }

    for (let i = 0; i < chartData.length - 1; i++) {
      const current = chartData[i];
      const next = chartData[i + 1];

      filledData.push(current); // Add the current entry to the filled data

      // Parse the current and next times
      const currentTime = new Date(current.time);
      const nextTime = new Date(next.time);

      // Calculate the time difference in hours
      const hoursDiff =
        (nextTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);

      if (hoursDiff > 1) {
        // Generate missing hours and interpolate temperatures
        for (let j = 1; j < hoursDiff; j++) {
          const missingTime = new Date(currentTime);
          missingTime.setHours(currentTime.getHours() + j);

          const interpolatedTemp =
            current.temperature +
            ((next.temperature - current.temperature) / hoursDiff) * j;

          filledData.push({
            time: missingTime.toISOString().replace("T", " ").slice(0, 19), // Format time like the input
            temperature: interpolatedTemp.toFixed(2),
          });
        }
      }
    }

    // Add the final entry
    filledData.push(chartData[chartData.length - 1]);

    setTemperatureArray(filledData);
  };

  useEffect(() => {
    handleSearch(); // Trigger the search when city or unit changes
    return () => handleSearch.cancel(); // Cleanup to avoid memory leaks
  }, [handleSearch]);

  return (
    <ThemeProvider theme={isDarkTheme ? darkTheme : lightTheme}>
      <AppContainer>
        <Header>
          <Title $isEmpty={city === ""}>Weather App</Title>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="City name..."
              value={city}
              onChange={handleCityChange}
            />
          </SearchContainer>

          {loading ? (
            <Spinner />
          ) : (
            <WeatherInfo
              weatherData={
                unit === "metric" ? weatherCelsius : weatherFahrenheit
              }
              city={city}
              forecastData={forecastData}
              unit={unit}
              chartData={temperatureArray}
            />
          )}
        </Header>
        {/* Theme Switch Button */}
        <ThemeSwitchButton onClick={toggleTheme}>
          {isDarkTheme ? "☀️" : "🌙"}
        </ThemeSwitchButton>
        <MeasurementSwitchButton
          onClick={() => {
            toggleUnit();
            if (city !== "") {
              setLoading(true);
            }
          }}
        >
          {unit !== "metric" ? "°C" : "°F"}
        </MeasurementSwitchButton>
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;
