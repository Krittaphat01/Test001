import { Box, Text } from "@chakra-ui/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function HourlyChart({ data }) {
  const chartData = data.time.map((t, i) => ({
    time: t.split("T")[1],
    temperature: data.temperature_2m[i],
  }));

  return (
    <Box bg="gray.100" _dark={{ bg: "gray.700" }} p={4} borderRadius="md" shadow="md">
      <Text fontSize="lg" fontWeight="semibold" mb={2}>
        Hourly Temperature (7 Days)
      </Text>
      <LineChart width={800} height={300} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="temperature" stroke="#3182ce" name="Temp (°C)" />
      </LineChart>
    </Box>
  );
}
