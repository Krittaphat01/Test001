import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import MapPicker from "../Map/MapPicker";

export default function AddLocationModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    lat: "",
    lon: "",
    timezone: "Asia/Bangkok",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelect = ({ name, lat, lon, timezone }) => {
    setForm({
      name: name || "Unknown",
      lat: lat.toFixed(4),
      lon: lon.toFixed(4),
      timezone: timezone || "Asia/Bangkok",
    });
  };

  const handleSubmit = () => {
    if (!form.lat || !form.lon) {
      alert("กรุณาเลือกตำแหน่งบนแผนที่ก่อนเพิ่มเมือง");
      return;
    }

    onSubmit(form);
    setForm({ name: "", lat: "", lon: "", timezone: "Asia/Bangkok" });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New City</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={3} align="stretch">
            <FormControl isRequired>
              <FormLabel>City Name</FormLabel>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Click on map to auto-fill"
                isReadOnly={true}
                bg="gray.50"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Latitude</FormLabel>
              <Input
                name="lat"
                value={form.lat}
                onChange={handleChange}
                readOnly
                bg="gray.50"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Longitude</FormLabel>
              <Input
                name="lon"
                value={form.lon}
                onChange={handleChange}
                readOnly
                bg="gray.50"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Timezone</FormLabel>
              <Select
                name="timezone"
                value={form.timezone}
                onChange={handleChange}
              >
                <option value="Asia/Bangkok">Asia/Bangkok</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
                <option value="Europe/London">Europe/London</option>
              </Select>
            </FormControl>
            <MapPicker onSelect={handleSelect} />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
            Add City
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
