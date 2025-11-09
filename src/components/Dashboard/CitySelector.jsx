import { useState, useRef, useEffect } from "react";
import {
  Box,
  Input,
  List,
  ListItem,
  Text,
  Flex,
  IconButton,
  useOutsideClick,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon, SearchIcon } from "@chakra-ui/icons";
import { openDB } from "../../lib/idb";

export default function CitySelector({ value, onSelect }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [cities, setCities] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef();

  const bgColor = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.600");
  const placeholderColor = useColorModeValue("gray.400", "gray.500");

  useOutsideClick({
    ref,
    handler: () => setIsOpen(false),
  });

  useEffect(() => {
    async function loadCities() {
      try {
        const db = await openDB();
        const tx = db.transaction("weather", "readonly");
        const store = tx.objectStore("weather");
        const req = store.getAll();

        req.onsuccess = (e) => {
          const allRecords = e.target.result;
          let allLocations = [];

          for (const record of allRecords) {
            const { key, value } = record;
            if (key === "locations" && Array.isArray(value)) {
              allLocations = value.map((loc) => ({
                name: loc.name || "Unknown",
                lat: loc.lat,
                lon: loc.lon,
                timezone: loc.timezone || "Asia/Bangkok",
              }));
            }
          }

          setCities(allLocations);
          setLocations(allLocations);
          setLoading(false);
        };

        req.onerror = () => {
          console.warn(" Failed to read IndexedDB weather store");
          setLoading(false);
        };
      } catch (err) {
        console.warn(" IndexedDB not available", err);
        setLoading(false);
      }
    }

    loadCities();
  }, []);

  const filtered = cities.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (city) => {
    const loc = locations.find((l) => l.name === city.name);
    onSelect(loc || city);
    setIsOpen(false);
    setQuery(""); // clear search
  };

  return (
    <Box position="relative" maxW="300px" ref={ref}>
      <Flex
        align="center"
        borderWidth="1px"
        borderRadius="md"
        px={3}
        py={2}
        cursor="pointer"
        borderColor={borderColor}
        bg={bgColor}
        color={textColor}
        onClick={() => setIsOpen(!isOpen)}
        _hover={{ borderColor: "blue.400" }}
        transition="all 0.2s"
      >
        <SearchIcon color="gray.400" mr={2} />
        <Input
          placeholder="Search or select a city..."
          value={isOpen ? query : value?.name || ""}
          onChange={(e) => setQuery(e.target.value)}
          border="none"
          bg="transparent"
          color={textColor}
          _placeholder={{ color: placeholderColor }}
          _focus={{ boxShadow: "none" }}
          cursor="pointer"
        />
        <IconButton
          icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          variant="ghost"
          size="sm"
          aria-label="toggle"
          colorScheme="gray"
        />
      </Flex>

      {/* 🔹 Dropdown list */}
      {isOpen && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          bg={bgColor}
          borderRadius="md"
          mt={1}
          borderWidth="1px"
          borderColor={borderColor}
          shadow="md"
          zIndex={10}
          p={2}
        >
          {loading ? (
            <Flex justify="center" py={4}>
              <Spinner size="sm" />
            </Flex>
          ) : filtered.length > 0 ? (
            <List maxH="180px" overflowY="auto">
              {filtered.map((c) => (
                <ListItem
                  key={c.name}
                  p={2}
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ bg: hoverBg }}
                  onClick={() => handleSelect(c)}
                >
                  {c.name}
                </ListItem>
              ))}
            </List>
          ) : (
            <Text
              color={placeholderColor}
              textAlign="center"
              py={2}
              fontSize="sm"
            >
              No results
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
}
