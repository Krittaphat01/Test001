
import {
  Box,
  Text,
  Flex,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import dayjs from "dayjs";

export default function DailyChart({ data }) {
  const bg = useColorModeValue("gray.50", "gray.800");
  const border = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const tempColor = useColorModeValue("#e53e3e", "#fc8181");
  const rainColor = useColorModeValue("#3182ce", "#63b3ed");
  const minTempColor = useColorModeValue("#38a169", "#68d391");

  if (!data || !data.time || data.time.length === 0) {
    return (
      <Flex
        bg={bg}
        borderWidth="1px"
        borderColor={border}
        p={4}
        borderRadius="lg"
        shadow="md"
        align="center"
        justify="center"
        minH="200px"
        mt={6}
      >
        <Spinner size="lg" color="blue.400" />
      </Flex>
    );
  }

  const chartData = data.time.map((t, i) => ({
    date: dayjs(t).format("DD/MM"),
    temp_max: data.temperature_2m_max?.[i] ?? null,
    temp_min: data.temperature_2m_min?.[i] ?? null,
    rain: data.precipitation_sum?.[i] ?? null,
  }));

  return (
    <Box
  bg={bg}
  borderWidth="1px"
  borderColor={border}
  p={4}
  borderRadius="xl"
  shadow="md"
  mt={8}
  overflowX="auto"
>
  <Text fontSize="lg" fontWeight="semibold" mb={3} color={textColor}>
    Daily Summary (7 Days)
  </Text>

  <Box minW={{ base: "800px", md: "100%" }} minH="350px">
    <ResponsiveContainer width="100%" aspect={3}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Bar yAxisId="right" dataKey="rain" fill={rainColor} name="Rain (mm)" barSize={14} />
        <Line yAxisId="left" type="monotone" dataKey="temp_max" stroke={tempColor} name="Max Temp" />
        <Line yAxisId="left" type="monotone" dataKey="temp_min" stroke={minTempColor} name="Min Temp" />
      </ComposedChart>
    </ResponsiveContainer>
  </Box>
</Box>

  );
}
