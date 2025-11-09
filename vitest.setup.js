import { vi } from "vitest";

// mock Chakra UI style functions
vi.mock("@chakra-ui/react", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    // eslint-disable-next-line no-unused-vars
    useColorModeValue: (light, _dark) => light,

  };
});
