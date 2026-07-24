import { describe, it, expect } from "vitest";
import { formatCPF, formatPhone, maskCPF } from "./format";

describe("format helpers", () => {
  it("formata CPF completo", () => {
    expect(formatCPF("12345678900")).toBe("123.456.789-00");
  });
  it("mascara CPF preservando extremidades", () => {
    expect(maskCPF("12345678900")).toBe("123.***.***-00");
  });
  it("formata telefone móvel", () => {
    expect(formatPhone("71985496972")).toBe("(71) 98549-6972");
  });
  it("formata telefone fixo", () => {
    expect(formatPhone("7132211234")).toBe("(71) 3221-1234");
  });
});
