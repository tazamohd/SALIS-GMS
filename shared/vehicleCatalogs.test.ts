import { describe, it, expect } from "vitest";
import {
  getMakeById,
  getModelsForMake,
  getNationalityById,
  vehicleMakes,
  vehicleModels,
  nationalities,
} from "./vehicleCatalogs";

describe("getMakeById", () => {
  it("returns the matching make", () => {
    expect(getMakeById("toyota")).toMatchObject({ id: "toyota", name: "Toyota" });
  });

  it("returns undefined for an unknown id", () => {
    expect(getMakeById("not-a-make")).toBeUndefined();
  });
});

describe("getModelsForMake", () => {
  it("returns only models belonging to the make", () => {
    const models = getModelsForMake("toyota");
    expect(models.length).toBeGreaterThan(0);
    expect(models.every((m) => m.makeId === "toyota")).toBe(true);
  });

  it("returns an empty array for an unknown make", () => {
    expect(getModelsForMake("not-a-make")).toEqual([]);
  });

  it("only references makes that exist in the catalog", () => {
    const makeIds = new Set(vehicleMakes.map((m) => m.id));
    for (const model of vehicleModels) {
      expect(makeIds.has(model.makeId)).toBe(true);
    }
  });
});

describe("getNationalityById", () => {
  it("round-trips a known nationality", () => {
    const first = nationalities[0];
    expect(getNationalityById(first.id)).toEqual(first);
  });

  it("returns undefined for an unknown id", () => {
    expect(getNationalityById("nope")).toBeUndefined();
  });
});
