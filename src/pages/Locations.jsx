// src/pages/Locations.jsx
import {
  Box,
  Heading,
  Button,
  useDisclosure,
  useToast,
  Spinner,
  Center,
  HStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import LocationsList from "../components/Locations/LocationsList";
import AddLocationModal from "../components/Locations/AddLocationModal";
import CompareModal from "../components/Locations/CompareModal"; // ✅ ใหม่
import { fetchLocations, addLocation } from "../api/locations";
import { useAuth } from "../hooks/useAuth";

export default function Locations() {
  const { token } = useAuth();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const addDisclosure = useDisclosure();
  const compareDisclosure = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    loadLocations();
  }, []);

  async function loadLocations() {
    setLoading(true);
    try {
      const data = await fetchLocations(token);
      if (Array.isArray(data)) setLocations(data);
      else setLocations([]);
    } catch {
      toast({ title: "Failed to fetch locations", status: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(location) {
    try {
      await addLocation(location, token);
      toast({ title: "City added!", status: "success" });
      addDisclosure.onClose();
      loadLocations(); // refresh list
    } catch {
      toast({ title: "Add failed", status: "error" });
    }
  }

  return (
    <Box p={4}>
      <Heading mb={4}>📍 Tracked Locations</Heading>

      {/* ✅ ปุ่ม Add + Compare */}
      <HStack mb={4} spacing={3}>
        <Button colorScheme="blue" onClick={addDisclosure.onOpen}>
          + Add City
        </Button>
        <Button colorScheme="purple" onClick={compareDisclosure.onOpen} isDisabled={locations.length < 2}>
          🔍 Compare Mode
        </Button>
      </HStack>

      {loading ? (
        <Center mt={10}>
          <Spinner size="xl" />
        </Center>
      ) : (
        <LocationsList locations={locations} />
      )}

      <AddLocationModal
        isOpen={addDisclosure.isOpen}
        onClose={addDisclosure.onClose}
        onSubmit={handleAdd}
      />

      {/* ✅ Modal Compare */}
      <CompareModal
        isOpen={compareDisclosure.isOpen}
        onClose={compareDisclosure.onClose}
        locations={locations}
      />
    </Box>
  );
}
