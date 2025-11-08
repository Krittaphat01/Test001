import { Box, Table, Thead, Tr, Th, Tbody, Td, Text } from "@chakra-ui/react";

export default function LocationsList({ locations }) {
  // ✅ ป้องกันไม่ให้ .map() พัง
  if (!Array.isArray(locations) || locations.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Text color="gray.400">No tracked cities yet</Text>
      </Box>
    );
  }

  return (
    <Table variant="simple" mt={4}>
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th isNumeric>Latitude</Th>
          <Th isNumeric>Longitude</Th>
          <Th>Timezone</Th>
        </Tr>
      </Thead>
      <Tbody>
        {locations.map((loc) => (
          <Tr key={loc.id || loc.name}>
            <Td>{loc.name ?? "—"}</Td>
            <Td isNumeric>{loc.lat ?? "—"}</Td>
            <Td isNumeric>{loc.lon ?? "—"}</Td>
            <Td>{loc.timezone ?? "—"}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
