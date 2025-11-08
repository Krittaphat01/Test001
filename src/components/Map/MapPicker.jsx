import { Box } from "@chakra-ui/react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// ✅ Fix: marker icons in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl,
  shadowUrl: iconShadow,
});

/* ---------------------- Utility: Reverse Geocoding ---------------------- */
async function getCityName(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
    );
    if (!res.ok) throw new Error("Failed to fetch city name");
    const data = await res.json();

    const name =
      data.address.city ||
      data.address.town ||
      data.address.village ||
      data.address.state ||
      "Unknown";

    const country = data.address.country || "";
    return {
      name: `${name}${country ? `, ${country}` : ""}`,
      timezone: data.address.timezone || "Asia/Bangkok",
    };
  } catch (e) {
    console.warn("⚠️ reverse geocode failed", e);
    return { name: "Unknown", timezone: "Asia/Bangkok" };
  }
}

/* ---------------------- LocationMarker Component ---------------------- */
function LocationMarker({ onSelect }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);

      // 🔍 Fetch name & timezone
      const info = await getCityName(lat, lng);

      // ✅ ส่งข้อมูลกลับไปให้ Modal
      onSelect({
        name: info.name,
        lat,
        lon: lng,
        timezone: info.timezone,
      });
    },
  });

  return position ? <Marker position={position}></Marker> : null;
}

/* ---------------------- MapPicker Main Component ---------------------- */
export default function MapPicker({ onSelect }) {
  return (
    <Box
      mt={4}
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      w="100%"
      h={{ base: "300px", md: "400px" }}
      position="relative"
    >
      {/* ✅ กล่องเลื่อนถ้าเกินพื้นที่ */}
      <Box w="100%" h="100%" overflow="auto">
        <MapContainer
          center={[18.7883, 98.9853]} // Default: Chiang Mai
          zoom={6}
          style={{
            height: "100%",
            width: "100%",
            minHeight: "300px",
            cursor: "crosshair",
          }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker onSelect={onSelect} />
        </MapContainer>
      </Box>
    </Box>
  );
}
