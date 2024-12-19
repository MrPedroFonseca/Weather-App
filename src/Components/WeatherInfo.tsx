import React from "react";
import Chart from "./Chart.tsx";
import styled from "styled-components";

const WeatherEmoji = styled.span`
  font-size: 2rem;
  margin-left: 1rem;
`;

const GridContainer = styled.div`
  display: grid;
  gap: 16px; /* Space between grid items, similar to spacing in Material-UI */
  padding: 16px;

  /* Responsive grid columns, mimicking Material-UI's breakpoints */
  grid-template-columns: repeat(1, 1fr); /* Default: 1 column */

  @media (min-width: 480px) {
    grid-template-columns: repeat(2, 1fr); /* Small screens: 2 columns */
  }

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr); /* Medium screens: 3 columns */
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(5, 1fr); /* Large screens: 4 columns */
  }
`;

const FlexBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 10%; /* Adds space between the two divs */
  padding: 20px;
  background-color: ${(props) => props.theme.colors.background};

  @media (max-width: 768px) {
    flex-direction: column; /* Stack divs vertically on smaller screens */
    align-items: center;
  }
`;

const ForecastCell = styled.div`
  border: 1px solid #ccc;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  background-color: ${(props) => props.theme.colors.background};
  text-align: center;
  width: 100%; /* Ensures it shrinks with the grid */
  min-width: 150px; /* Prevents the card from becoming too small */
  overflow: hidden;

  h4 {
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }

  p {
    margin: 0.2rem 0;
    font-size: 0.9rem;
  }
`;

const Main = styled.div`
  margin-top: 1%;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const WeatherInfo = ({ weatherData, city, forecastData, unit, chartData }) => {
  if (city === "") {
    return <></>;
  }
  if (!weatherData) {
    return <p>No weather data available for "{city}"</p>;
  }
  const getWeatherEmoji = (condition) => {
    switch (condition) {
      case "Clear":
        return "☀️"; // Sunny
      case "Clouds":
        return "☁️"; // Cloudy
      case "Rain":
        return "🌧️"; // Rainy
      case "Snow":
        return "❄️"; // Snowy
      case "Thunderstorm":
        return "⚡"; // Thunderstorm
      case "Drizzle":
        return "🌦️"; // Light rain
      default:
        return "🌈"; // Default (for unknown condition)
    }
  };

  return (
    <Main>
      <ForecastCell style={{ width: "98%", marginLeft: "1%" }}>
        <h4>Today</h4>
        <FlexBox>
          <div>
            <p>
              <span style={{ fontWeight: "bold" }}>Temperature:</span>{" "}
              {weatherData.main.temp} {unit === "metric" ? "°C" : "°F"}
            </p>
            <p>
              <span style={{ fontWeight: "bold" }}>Max Temp:</span>{" "}
              {weatherData.main.temp_max.toFixed(1)}{" "}
              {unit === "metric" ? "°C" : "°F"}
            </p>
            <p>
              <span style={{ fontWeight: "bold" }}>Min Temp:</span>{" "}
              {weatherData.main.temp_min.toFixed(1)}{" "}
              {unit === "metric" ? "°C" : "°F"}
            </p>
          </div>
          <WeatherEmoji>
            {getWeatherEmoji(weatherData.weather[0].main)}
          </WeatherEmoji>
          <div>
            <p>
              <span style={{ fontWeight: "bold" }}>Feels like:</span>{" "}
              {weatherData.main.feels_like} {unit === "metric" ? "°C" : "°F"}
            </p>
            <p>
              <span style={{ fontWeight: "bold" }}>Weather:</span>{" "}
              {weatherData.weather[0].description}
            </p>
            <p>
              <span style={{ fontWeight: "bold" }}>Humidity:</span>{" "}
              {weatherData.main.humidity}%
            </p>
          </div>
        </FlexBox>
      </ForecastCell>

      <GridContainer>
        {forecastData.map((day, index) => (
          <ForecastCell key={index}>
            <h4>{day.date}</h4>
            <WeatherEmoji>{getWeatherEmoji(day.weather)}</WeatherEmoji>
            <p>
              <span style={{ fontWeight: "bold" }}>Max Temp:</span>{" "}
              {day.max.toFixed(1)} {unit === "metric" ? "°C" : "°F"}
            </p>
            <p style={{ marginBottom: "5%" }}>
              <span style={{ fontWeight: "bold" }}>Min Temp:</span>{" "}
              {day.min.toFixed(1)} {unit === "metric" ? "°C" : "°F"}
            </p>
          </ForecastCell>
        ))}
      </GridContainer>

      <Chart chartData={chartData} unit={unit === "metric" ? "°C" : "°F"} />
    </Main>
  );
};

export default WeatherInfo;
