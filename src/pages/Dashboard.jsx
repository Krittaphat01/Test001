import { Box, Grid, Heading, Spinner, Center } from "@chakra-ui/react";
import CitySelector from "../components/Dashboard/CitySelector";
import WeatherCard from "../components/Dashboard/WeatherCard";
import HourlyChart from "../components/Dashboard/HourlyChart";
import DailyChart from "../components/Dashboard/DailyChart";
import { useWeather } from "../hooks/useWeather";
import { useState } from "react";

export default function Dashboard() {
  const [selectedCity, setSelectedCity] = useState({
    name: "Chiang Mai",
    lat: 18.7883,
    lon: 98.9853,
    timezone: "Asia/Bangkok",
  });

  const [selectedMetric, setSelectedMetric] = useState("temperature");
  const { data, loading, error } = useWeather(selectedCity.lat, selectedCity.lon);

  if (loading)
    return (
      <Center h="60vh">
        <Spinner size="xl" />
      </Center>
    );

  if (error)
    return (
      <Center h="60vh">
        <Heading color="red.400">⚠️Failed to load weather data</Heading>
      </Center>
    );

  const current = data?.current || {};
  const hourly = data?.hourly || {};
  const daily = data?.daily || {};

  const updatedAt = data?.updatedAt || Date.now();

  const metrics = [
    {
      key: "temperature",
      title: "Temperature",
      value:
        current.temperature_2m !== undefined
          ? `${current.temperature_2m} °C`
          : "—",
    },
    {
      key: "humidity",
      title: "Humidity",
      value:
        current.relative_humidity_2m !== undefined
          ? `${current.relative_humidity_2m} %`
          : "—",
    },
    {
      key: "wind",
      title: "Wind Speed",
      value:
        current.wind_speed_10m !== undefined
          ? `${current.wind_speed_10m} m/s`
          : "—",
    },
    {
      key: "rain",
      title: "Rain",
      value:
        current.precipitation !== undefined
          ? `${current.precipitation} mm`
          : "—",
    },
  ];

  return (
    <Box p={4}>
      <Heading mb={4}> Weather Dashboard</Heading>
      <CitySelector onSelect={setSelectedCity} />
      <Grid
        templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }}
        gap={4}
        mt={4}
      >
        {metrics.map((m) => (
          <WeatherCard
            key={m.key}
            title={m.title}
            value={m.value}
            updatedAt={updatedAt} 
            isActive={selectedMetric === m.key}
            onClick={() => setSelectedMetric(m.key)}
          />
        ))}
      </Grid>
      <Box mt={8}>
        <HourlyChart data={hourly} metric={selectedMetric} />
        <DailyChart data={daily} mt={8} />
      </Box>
    </Box>
  );
}
