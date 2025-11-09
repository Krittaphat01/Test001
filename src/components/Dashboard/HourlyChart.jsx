import {
  Box,
  Text,
  useColorModeValue,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import dayjs from "dayjs";



export default function HourlyChart({ data, metric = "temperature" }) {
  const bg = useColorModeValue("gray.50", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const gridColor = useColorModeValue("#E2E8F0", "#2D3748");
  const tooltipBg = useColorModeValue("white", "#1A202C");
  const tooltipText = useColorModeValue("gray.800", "gray.100");
  const legendText = useColorModeValue("gray.700", "gray.300");
  const lineColor = useColorModeValue("#2B6CB0", "#63B3ED"); 
  const MotionBox = motion.div;
  if (!data?.time || data.time.length === 0)
    return (
      <Flex
        bg={bg}
        p={4}
        borderRadius="lg"
        justify="center"
        align="center"
        h="200px"
      >
        <Spinner size="lg" color={lineColor} />
      </Flex>
    );

  const metricMap = {
    temperature: { key: "temperature_2m", label: "Temperature (°C)" },
    humidity: { key: "relative_humidity_2m", label: "Humidity (%)" },
    wind: { key: "wind_speed_10m", label: "Wind Speed (m/s)" },
    rain: { key: "precipitation", label: "Precipitation (mm)" },
  };

  const field = metricMap[metric]?.key || "temperature_2m";
  const label = metricMap[metric]?.label || "Temperature (°C)";
  const chartData = data.time.map((t, i) => ({
    time: dayjs(t).format("DD/MM HH:mm"),
    value: data[field]?.[i] ?? null,
  }));

  return (
    <Box
      bg={bg}
      borderWidth="1px"
      borderColor={border}
      p={4}
      borderRadius="xl"
      shadow="md"
      mt={6}
      overflowX="auto"
      transition="background-color 0.2s ease, border-color 0.2s ease"
    >
      <Text fontSize="lg" fontWeight="semibold" mb={3} color={textColor}>
       {label} (Last 7 Days)
      </Text>
      <motion.div
        key={metric}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Box minW={{ base: "700px", md: "100%" }} h="350px">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.slice(-168)}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: textColor }}
                interval={23}
              />
              <YAxis
                tick={{ fill: textColor }}
                axisLine={{ stroke: border }}
                tickLine={{ stroke: border }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  borderColor: border,
                  borderRadius: "8px",
                }}
                labelStyle={{ color: tooltipText }}
                itemStyle={{ color: tooltipText }}
              />
              <Legend
                wrapperStyle={{
                  color: legendText,
                  fontSize: 12,
                  paddingTop: 8,
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={lineColor}
                strokeWidth={2.5}
                dot={false}
                name={label}
                animationDuration={400}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </motion.div>
    </Box>
  );
}
