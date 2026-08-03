import { describe, it, expect } from "vitest";
import { extractVehicleFields } from "../vehicleDocOcr";

describe("extractVehicleFields", () => {
  it("pulls VIN, make and year from vehicle-registration text", () => {
    const text = "Kingdom of Saudi Arabia — Vehicle Registration\nMake: Toyota  Model: Camry\nModel Year 2022\nChassis No 4T1BF1FK5GU123456\nPlate ABC-1234";
    const f = extractVehicleFields(text, "license");
    expect(f.vin).toBe("4T1BF1FK5GU123456");
    expect(f.make).toBe("Toyota");
    expect(f.year).toBe(2022);
    expect(f.licensePlate).toBe("ABC-1234");
  });

  it("prefers the longer brand name (Land Rover over Rover)", () => {
    const f = extractVehicleFields("Vehicle: Land Rover Defender 2021", "license");
    expect(f.make).toBe("Land Rover");
  });

  it("extracts insurer, policy number and ISO expiry from insurance text", () => {
    const text = "Tawuniya Motor Insurance\nPolicy No: POL-2024-88XZ\nExpiry Date: 2026-11-30\nInsured Vehicle: Nissan Patrol";
    const f = extractVehicleFields(text, "insurance");
    expect(f.insuranceProvider).toBe("Tawuniya");
    expect(f.insurancePolicyNumber).toBe("POL-2024-88XZ");
    expect(f.insuranceExpiry).toBe("2026-11-30");
  });

  it("normalizes a dd/mm/yyyy expiry to ISO", () => {
    const f = extractVehicleFields("Bupa Arabia policy number 12345678 valid until 05/09/2027", "insurance");
    expect(f.insuranceProvider).toBe("Bupa Arabia");
    expect(f.insuranceExpiry).toBe("2027-09-05");
  });

  it("returns an empty object when nothing recognizable is present", () => {
    expect(extractVehicleFields("random unrelated text", "license")).toEqual({});
  });
});
