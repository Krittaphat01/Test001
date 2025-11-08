import { useState, useRef } from "react";
import {
  Box,
  Input,
  List,
  ListItem,
  Text,
  Flex,
  IconButton,
  useOutsideClick,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon, SearchIcon } from "@chakra-ui/icons";

const CITY_LIST = [
  { name: "Bangkok", lat: 13.7563, lon: 100.5018 },
  { name: "Chiang Mai", lat: 18.7883, lon: 98.9853 },
  { name: "Phuket", lat: 7.8804, lon: 98.3923 },
  { name: "Khon Kaen", lat: 16.4419, lon: 102.8350 },
  { name: "Pattaya", lat: 12.9236, lon: 100.8825 },
];

export default function CitySelector({ onSelect }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef();

  useOutsideClick({
    ref,
    handler: () => setIsOpen(false),
  });

  const filtered = CITY_LIST.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (city) => {
    setSelected(city);
    onSelect({ ...city, timezone: "Asia/Bangkok" });
    setQuery("");
    setIsOpen(false);
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
        onClick={() => setIsOpen(!isOpen)}
        _hover={{ borderColor: "blue.400" }}
      >
        <SearchIcon color="gray.400" mr={2} />
        <Text flex="1" color={selected ? "black" : "gray.400"}>
          {selected ? selected.name : "Select a city..."}
        </Text>
        <IconButton
          icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          variant="ghost"
          size="sm"
          aria-label="toggle"
        />
      </Flex>

      {isOpen && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          bg="white"
          borderRadius="md"
          mt={1}
          shadow="md"
          zIndex={10}
          p={2}
        >
          <Input
            placeholder="Search cities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            mb={2}
            size="sm"
          />
          <List maxH="180px" overflowY="auto">
            {filtered.length > 0 ? (
              filtered.map((c) => (
                <ListItem
                  key={c.name}
                  p={2}
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ bg: "gray.50" }}
                  onClick={() => handleSelect(c)}
                >
                  {c.name}
                </ListItem>
              ))
            ) : (
              <Text color="gray.400" textAlign="center" py={2}>
                No results
              </Text>
            )}
          </List>
        </Box>
      )}
    </Box>
  );
}
