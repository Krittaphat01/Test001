import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Button,
  Text,
  Avatar,
  Tooltip,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid"; 

import Dashboard from "./pages/Dashboard";
import Locations from "./pages/Locations";

// ฟังก์ชันสร้าง token แบบ guest
function ensureGuestToken() {
  let token = localStorage.getItem("token");
  if (!token) {
    token = `guest_${uuidv4()}`;
    localStorage.setItem("token", token);
  }
  return token;
}

function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const headingColor = useColorModeValue("gray.800", "yellow.200");
  const headingIcon = colorMode === "light" ? "🌤️" : "🌙";
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const guestToken = ensureGuestToken();
    setToken(guestToken);
  }, []);

  const guestLabel = token ? token.split("_")[0] : "guest";

  return (
    <Flex justify="space-between" align="center" mb={6} pr={4}>
      <Heading size="3xl" color={headingColor}>
        {headingIcon}
      </Heading>
      <Flex align="center" gap={2}>
        <Button as={Link} to="/" colorScheme="blue" variant="outline">
          Locations
        </Button>
        <Button as={Link} to="/dashboard" colorScheme="teal" variant="outline">
          Dashboard
        </Button>
        <Button onClick={toggleColorMode}>
          {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
        </Button>
        <Tooltip
          label={`Token: ${token}`}
          aria-label="Guest token"
          placement="bottom"
          hasArrow
        >
          <Flex align="center" gap={2}>
            <Avatar
              size="sm"
              name={guestLabel}
              bg={useColorModeValue("blue.500", "blue.300")}
              color="white"
            />
          </Flex>
        </Tooltip>
      </Flex>
    </Flex>
  );
}

function App() {
  return (
    <Router>
      <Box p={4}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Locations />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
