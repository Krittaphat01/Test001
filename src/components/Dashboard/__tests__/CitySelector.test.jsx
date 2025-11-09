/* eslint-env vitest */
import { render, screen } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import CitySelector from "../CitySelector";

describe("CitySelector Component", () => {
  it("แสดง placeholder เริ่มต้น", () => {
    render(
      <ChakraProvider>
        <CitySelector onSelect={() => {}} />
      </ChakraProvider>
    );

    // ✅ ใช้ getByPlaceholderText แทน getByText
    const input = screen.getByPlaceholderText(/search or select a city/i);
    expect(input).toBeInTheDocument();
  });
});
