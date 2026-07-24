import { describe, it, expect } from "vitest";
import { maskCPF, maskPhone } from "./format";

describe("format helpers", () => {
  it("mascara CPF completo", () => {
    expect(maskCPF("12345678900")).toBe("123.456.789-00");
  });
  it("mascara telefone móvel", () => {
    expect(maskPhone("71985496972")).toBe("(71) 98549-6972");
  });
});
