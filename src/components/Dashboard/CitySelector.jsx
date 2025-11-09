import { useState, useRef, useEffect } from "react";
import {
  Box,
  Input,
  List,
  ListItem,
  Text,
  Flex,
  Spinner,
  useOutsideClick,
  useColorModeValue,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { openDB } from "../../lib/idb";
import { flushSync } from "react-dom";

export default function CitySelector({ onSelect, selectedCity }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef();

  const bgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.600");
  const textColor = useColorModeValue("gray.800", "gray.100");
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
        const req = store.get("locations");

        req.onsuccess = (e) => {
          const data = e.target.result;
          if (data && Array.isArray(data.value)) {
            const allCities = data.value.map((loc) => ({
              name: loc.name || "Unknown",
              lat: loc.lat,
              lon: loc.lon,
              timezone: loc.timezone || "Asia/Bangkok",
            }));
            setCities(allCities);
          } else {
            console.warn("⚠️ No locations found in IndexedDB.");
            setCities([]);
          }
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


  const handleSelect = (city) => {
    flushSync(() => {
      setQuery(""); 
    });
    onSelect(city);
    setIsOpen(false);
  };

  const filtered = cities.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleFocus = () => {
    if (!isOpen) setIsOpen(true);
  };


  const getPlaceholderText = () => {
    if (selectedCity) {
      return selectedCity.name; 
    }
    return "Search or select a city..."; 
  };

  return (
    <Box position="relative" maxW="300px" ref={ref}>
      <Flex
        align="center"
        borderWidth="1px"
        borderRadius="md"
        px={3}
        py={2}
        bg={bgColor}
        borderColor={borderColor}
        color={textColor}
        cursor="text"
        transition="all 0.2s"
        _hover={{ borderColor: "blue.400" }}
        _focusWithin={{ borderColor: "blue.500" }}
      >
        <SearchIcon color="gray.400" mr={2} />
        <Input
          placeholder={getPlaceholderText()}
          value={query}
          onFocus={handleFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true); 
          }}
          variant="unstyled"
          color={textColor}
          _placeholder={{ color: placeholderColor }}
          flex="1"
        />
      </Flex>

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
          transition="all 0.2s"
        >
          {loading ? (
            <Flex justify="center" py={4}>
              <Spinner size="sm" />
            </Flex>
          ) : filtered.length > 0 ? (
            <List maxH="200px" overflowY="auto">
              {filtered.map((c) => (
                <ListItem
                  key={`${c.lat}-${c.lon}`}
                  px={3}
                  py={2}
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ bg: hoverBg }}
                  onClick={() => handleSelect(c)}
                  color={textColor}
                >
                  {c.name}
                </ListItem>
              ))}
            </List>
          ) : (
            <Text
              color={placeholderColor}
              textAlign="center"
              py={3}
              fontSize="sm"
            >
              No results found
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
}