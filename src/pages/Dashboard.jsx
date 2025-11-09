import { Box, Grid, Heading, Spinner, Center } from "@chakra-ui/react";
import CitySelector from "../components/Dashboard/CitySelector";
import WeatherCard from "../components/Dashboard/WeatherCard";
import HourlyChart from "../components/Dashboard/HourlyChart";
import DailyChart from "../components/Dashboard/DailyChart";
import { useWeather } from "../hooks/useWeather";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryCity = searchParams.get("location") || "Chiang Mai";
  const queryMetric = searchParams.get("metric") || "temperature";

  const [selectedCity, setSelectedCity] = useState({
    name: queryCity,
    lat: 18.7883,
    lon: 98.9853,
    timezone: "Asia/Bangkok",
  });

  const [selectedMetric, setSelectedMetric] = useState(queryMetric);

  const { data, loading, error } = useWeather(selectedCity.lat, selectedCity.lon);


  useEffect(() => {
    setSearchParams({
      location: selectedCity.name,
      metric: selectedMetric,
    });
  }, [selectedCity, selectedMetric, setSearchParams]);

  if (loading)
    return (
      <Center h="60vh">
        <Spinner size="xl" />
      </Center>
    );

  if (error)
    return (
      <Center h="60vh">
        <Heading color="red.400"> Failed to load weather data</Heading>
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
      <CitySelector
        value={selectedCity}
        onSelect={(city) => {
        setSelectedCity(city);
        setSearchParams({
      location: city.name,
      metric: selectedMetric,
        });
      }}
      />
      <Box
    mt={6}
    p={4}
    borderWidth="1px"
    borderRadius="xl"
    shadow="md"
    bg="gray.50"
    _dark={{ bg: "gray.700" }}
  >
    <Grid
      templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }}
      gap={4}
      mb={6}
    >
      {metrics.map((m) => (
        <WeatherCard
          key={m.key}
          title={m.title}
          value={m.value}
          updatedAt={updatedAt}
          isActive={selectedMetric === m.key}
          onClick={() => {
            setSelectedMetric(m.key);
            setSearchParams({
              location: selectedCity.name,
              metric: m.key,
            });
          }}
        />
      ))}
    </Grid>

    {/* กราฟรายชั่วโมง */}
    <HourlyChart data={hourly} metric={selectedMetric} />
  </Box>

  {/* 🔹 กราฟรายวัน (อยู่นอก box) */}
  <Box mt={8}>
    <DailyChart data={daily} />
  </Box>
</Box>
  );
}
