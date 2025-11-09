import {
  Box,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";

export default function LocationsList({ locations }) {
  const tableSize = useBreakpointValue({
    base: "sm",
    md: "md",
  });

  const fontSize = useBreakpointValue({
    base: "sm",
    md: "md",
  });

  // 🎨 ใช้สีตามโหมด (Light / Dark)
  const bgColor = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subTextColor = useColorModeValue("gray.600", "gray.400");
  const rowEvenBg = useColorModeValue("gray.50", "gray.700");
  const hoverBg = useColorModeValue("gray.100", "gray.600");

  if (!Array.isArray(locations) || locations.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Text color={subTextColor}>No tracked cities yet</Text>
      </Box>
    );
  }

  return (
    <Box
      overflowX="auto"
      overflowY="hidden"
      whiteSpace="nowrap"
      borderRadius="md"
      borderWidth="1px"
      borderColor={borderColor}
      shadow="sm"
      mt={4}
      maxW="100%"
      bg={bgColor}
      transition="all 0.2s ease"
    >
      <Table
        variant="simple"
        size={tableSize}
        minWidth="600px"
        fontSize={fontSize}
      >
        <Thead bg={headerBg}>
          <Tr>
            <Th minWidth="150px" color={textColor}>
              Name
            </Th>
            <Th minWidth="120px" isNumeric color={textColor}>
              Latitude
            </Th>
            <Th minWidth="120px" isNumeric color={textColor}>
              Longitude
            </Th>
            <Th minWidth="150px" color={textColor}>
              Timezone
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {locations.map((loc, index) => (
            <Tr
              key={loc.id || loc.name || index}
              _even={{ bg: rowEvenBg }}
              _hover={{ bg: hoverBg }}
              transition="background 0.2s ease"
            >
              <Td minWidth="150px" fontWeight="medium" color={textColor}>
                {loc.name ?? "—"}
              </Td>
              <Td
                minWidth="120px"
                isNumeric
                fontFamily="mono"
                color={subTextColor}
              >
                {loc.lat ?? "—"}
              </Td>
              <Td
                minWidth="120px"
                isNumeric
                fontFamily="mono"
                color={subTextColor}
              >
                {loc.lon ?? "—"}
              </Td>
              <Td minWidth="150px" color={subTextColor}>
                {loc.timezone ?? "—"}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
