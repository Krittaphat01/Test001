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

  const { data, loading, error } = useWeather(
    selectedCity.lat,
    selectedCity.lon
  );

  if (loading)
    return (
      <Center h="60vh">
        <Spinner size="xl" />
      </Center>
    );

  if (error)
    return (
      <Center h="60vh">
        <Heading color="red.400">⚠️ Failed to load weather data</Heading>
      </Center>
    );

  // ✅ ป้องกัน null (ใช้ optional chaining)
  const current = data?.current || {};
  const hourly = data?.hourly || { time: [], temperature_2m: [] };
  const daily = data?.daily || {
    time: [],
    temperature_2m_max: [],
    temperature_2m_min: [],
    precipitation_sum: [],
  };

  return (
    <Box p={4}>
      <Heading mb={4}>🌤️ Weather Dashboard</Heading>
      <CitySelector onSelect={setSelectedCity} />

      {/* Weather Summary Card */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4} mt={4}>
        <WeatherCard
          title="Temperature"
          value={
            current?.temperature_2m !== undefined
              ? `${current.temperature_2m} °C`
              : "—"
          }
        />
        <WeatherCard
          title="Humidity"
          value={
            current?.relative_humidity_2m !== undefined
              ? `${current.relative_humidity_2m} %`
              : "—"
          }
        />
        <WeatherCard
          title="Wind Speed"
          value={
            current?.wind_speed_10m !== undefined
              ? `${current.wind_speed_10m} m/s`
              : "—"
          }
        />
        <WeatherCard
          title="Rain"
          value={
            current?.precipitation !== undefined
              ? `${current.precipitation} mm`
              : "—"
          }
        />
      </Grid>

      {/* Charts */}
      <Box mt={8}>
        <HourlyChart data={hourly} />
        <DailyChart data={daily} mt={8} />
      </Box>
    </Box>
  );
}
