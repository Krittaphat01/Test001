import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Box, Flex, Heading, Button, useColorMode } from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";

import Dashboard from "./pages/Dashboard";
import Locations from "./pages/Locations";

function App() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Router>
      <Box p={4}>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="3xl">🌤️ </Heading>
          <Flex gap={2}>
            <Button as={Link} to="/">Locations</Button>
            <Button as={Link} to="/dashboard">Dashboard</Button>
            <Button onClick={toggleColorMode}>
              {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            </Button>
          </Flex>
        </Flex>

        <Routes>
          <Route path="/" element={<Locations />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
