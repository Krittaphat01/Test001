// src/components/Locations/CompareModal.jsx
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  Center,
  Spinner,
  Text,
  Box,
} from "@chakra-ui/react";
import { useState } from "react";
import { getDailyData } from "../../api/weather";
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  Bar,
  CartesianGrid,
} from "recharts";

export default function CompareModal({ isOpen, onClose, locations }) {
  const [cityA, setCityA] = useState("");
  const [cityB, setCityB] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleCompare() {
  if (!cityA || !cityB || cityA === cityB) {
    alert("Please select 2 different cities.");
    return;
  }

  setLoading(true);

  // ✅ แก้ logic ให้ robust และปลอดภัย
  const normalizeKey = (val) => String(val).toLowerCase().trim();
  const locA = locations.find(
    (l) =>
      normalizeKey(l.id ?? l._id ?? l.name) === normalizeKey(cityA)
  );
  const locB = locations.find(
    (l) =>
      normalizeKey(l.id ?? l._id ?? l.name) === normalizeKey(cityB)
  );

  // ✅ ถ้าไม่เจอเมือง → แจ้งเตือนและหยุด
  if (!locA || !locB) {
    alert("Could not find selected cities in data.");
    setLoading(false);
    return;
  }

  try {
    const [dailyA, dailyB] = await Promise.all([
      getDailyData(locA.lat, locA.lon, locA.timezone),
      getDailyData(locB.lat, locB.lon, locB.timezone),
    ]);

    const dates = new Set([...dailyA.time, ...dailyB.time]);
    const sorted = [...dates].sort();

    const merged = sorted.map((d) => {
      const iA = dailyA.time.indexOf(d);
      const iB = dailyB.time.indexOf(d);
      return {
        date: d,
        [`${locA.name}_temp`]: iA >= 0 ? dailyA.temperature_2m_max[iA] : null,
        [`${locA.name}_rain`]: iA >= 0 ? dailyA.precipitation_sum[iA] : null,
        [`${locB.name}_temp`]: iB >= 0 ? dailyB.temperature_2m_max[iB] : null,
        [`${locB.name}_rain`]: iB >= 0 ? dailyB.precipitation_sum[iB] : null,
      };
    });

    setData(merged);
  } catch (e) {
    console.error("Compare failed", e);
    alert("Compare failed: " + e.message);
  } finally {
    setLoading(false);
  }
}

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>🌡️ Compare Cities (Temp & Rain)</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Box mb={4} display="flex" gap={3}>
            <Select
              placeholder="Select first city"
              value={cityA}
              onChange={(e) => setCityA(e.target.value)}
            >
              {locations.map((loc) => (
                <option key={loc.id ?? loc.name} value={loc.id ?? loc.name}>
                  {loc.name}
                </option>
              ))}
            </Select>

            <Select
              placeholder="Select second city"
              value={cityB}
              onChange={(e) => setCityB(e.target.value)}
            >
              {locations.map((loc) => (
                <option key={loc.id ?? loc.name} value={loc.id ?? loc.name}>
                  {loc.name}
                </option>
              ))}
            </Select>

            <Button colorScheme="purple" onClick={handleCompare}>
              Compare
            </Button>
          </Box>

          {loading ? (
            <Center py={10}>
              <Spinner size="xl" />
            </Center>
          ) : data.length === 0 ? (
            <Text color="gray.500">Select 2 cities and click Compare.</Text>
          ) : (
            <Box w="100%" h="400px">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(d) => d.split("T")[0]} />
                  <YAxis yAxisId="left" label={{ value: "Temp (°C)", angle: -90, position: "insideLeft" }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: "Rain (mm)", angle: 90, position: "insideRight" }} />
                  <Tooltip />
                  <Legend />
                  {Object.keys(data[0])
                    .filter((k) => k.includes("_temp"))
                    .map((k) => (
                      <Line key={k} yAxisId="left" type="monotone" dataKey={k} dot={false} strokeWidth={2} />
                    ))}
                  {Object.keys(data[0])
                    .filter((k) => k.includes("_rain"))
                    .map((k) => (
                      <Bar key={k} yAxisId="right" dataKey={k} barSize={8} />
                    ))}
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
