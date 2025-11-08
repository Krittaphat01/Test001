import { Box, Text } from "@chakra-ui/react";

export default function WeatherCard({ title, value }) {
  return (
    <Box
      p={4}
      bg="gray.100"
      _dark={{ bg: "gray.700" }}
      borderRadius="md"
      textAlign="center"
      shadow="md"
    >
      <Text fontSize="sm" color="gray.500">
        {title}
      </Text>
      <Text fontSize="2xl" fontWeight="bold">
        {value}
      </Text>
    </Box>
  );
}
