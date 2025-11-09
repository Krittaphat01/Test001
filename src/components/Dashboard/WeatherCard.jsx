import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Heading,
  Text,
  Box,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import dayjs from "dayjs";

export default function WeatherCard({
  title,
  value,
  updatedAt,
  isRefreshing,
  isActive,
  onClick,
}) {
  const bg = useColorModeValue("gray.50", "gray.800");
  const activeBg = useColorModeValue("blue.50", "blue.900");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const activeBorder = useColorModeValue("blue.400", "blue.300");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const accentColor = useColorModeValue("blue.600", "blue.300");

  const formattedTime = updatedAt ? dayjs(updatedAt).format("HH:mm") : "—";

  return (
    <Card
      bg={isActive ? activeBg : bg}
      borderWidth="2px"
      borderColor={isActive ? activeBorder : borderColor}
      borderRadius="2xl"
      shadow={isActive ? "lg" : "md"}
      transition="all 0.2s ease"
      _hover={{ shadow: "lg", transform: "translateY(-3px)", cursor: "pointer" }}
      textAlign="center"
      p={2}
      onClick={onClick} 
    >
      <CardHeader pb={1}>
        <Heading as="h3" size="sm" color={textColor}>
          ล่าสุด:{" "}
          <Text as="span" color={accentColor}>
            {title}
          </Text>
        </Heading>
      </CardHeader>

      <CardBody pt={1}>
        {isRefreshing ? (
          <Spinner size="lg" color={accentColor} />
        ) : (
          <Text fontSize="3xl" fontWeight="bold">
            {value || "—"}
          </Text>
        )}
      </CardBody>

      <CardFooter pt={0}>
        <Box w="100%">
          <Text fontSize="xs" color="gray.500" _dark={{ color: "gray.400" }}>
            อัปเดตล่าสุดเมื่อ {formattedTime} น.
          </Text>
        </Box>
      </CardFooter>
    </Card>
  );
}
