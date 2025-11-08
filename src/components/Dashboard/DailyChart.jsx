import { Box, Text } from "@chakra-ui/react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function DailyChart({ data }) {
  const chartData = data.time.map((d, i) => ({
    date: d,
    temp_max: data.temperature_2m_max[i],
    temp_min: data.temperature_2m_min[i],
    rain: data.precipitation_sum[i],
  }));

  return (
    <Box bg="gray.100" _dark={{ bg: "gray.700" }} p={4} borderRadius="md" shadow="md">
      <Text fontSize="lg" fontWeight="semibold" mb={2}>
        Daily Summary (7 Days)
      </Text>
      <ComposedChart width={800} height={300} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="rain" barSize={20} fill="#60a5fa" name="Rain (mm)" />
        <Line type="monotone" dataKey="temp_max" stroke="#f87171" name="Temp Max" />
        <Line type="monotone" dataKey="temp_min" stroke="#34d399" name="Temp Min" />
      </ComposedChart>
    </Box>
  );
}
