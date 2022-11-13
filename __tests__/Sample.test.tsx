import { add, subtract } from "../components/Sample";

describe("Sample Componenet functions are correct", () => {
  describe("add function", () => {
    test("Add 1 + 2 equals 3", () => {
      expect(add(1, 2)).toBe(3);
    });
  });
  describe("subtract function", () => {
    test("Add 2 - 1 equals 1", () => {
      expect(subtract(2, 1)).toBe(1);
    });
  });
});
