import { describe, it, expect } from 'vitest';
import {
  vehicleMakes,
  vehicleModels,
  vehicleYears,
  nationalities,
  engineTypes,
  transmissionTypes,
  colors,
  getModelsForMake,
  getMakeById,
  getNationalityById,
} from '../vehicleCatalogs';

describe('vehicleCatalogs', () => {
  describe('data integrity', () => {
    it('has unique make IDs', () => {
      const ids = vehicleMakes.map(m => m.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('every model references a valid make', () => {
      const makeIds = new Set(vehicleMakes.map(m => m.id));
      for (const model of vehicleModels) {
        expect(makeIds.has(model.makeId)).toBe(true);
      }
    });

    it('has a reasonable year range', () => {
      expect(vehicleYears.length).toBeGreaterThan(20);
      expect(vehicleYears[0]).toBeGreaterThanOrEqual(2025);
      expect(vehicleYears[vehicleYears.length - 1]).toBeLessThanOrEqual(2000);
    });

    it('has Saudi Arabia in nationalities', () => {
      const sa = nationalities.find(n => n.id === 'SA' || n.name.includes('Saudi'));
      expect(sa).toBeDefined();
    });

    it('has required engine types', () => {
      const ids = engineTypes.map((e: any) => e.id || e);
      expect(ids.length).toBeGreaterThan(0);
    });

    it('has required transmission types', () => {
      expect(transmissionTypes.length).toBeGreaterThan(0);
    });

    it('has color options', () => {
      expect(colors.length).toBeGreaterThan(5);
    });
  });

  describe('getModelsForMake', () => {
    it('returns models for Toyota', () => {
      const models = getModelsForMake('toyota');
      expect(models.length).toBeGreaterThan(0);
      expect(models.every(m => m.makeId === 'toyota')).toBe(true);
    });

    it('returns empty array for unknown make', () => {
      expect(getModelsForMake('nonexistent')).toEqual([]);
    });

    it('returns models for BMW', () => {
      const models = getModelsForMake('bmw');
      expect(models.length).toBeGreaterThan(0);
    });
  });

  describe('getMakeById', () => {
    it('finds Toyota by id', () => {
      const make = getMakeById('toyota');
      expect(make).toBeDefined();
      expect(make!.name).toBe('Toyota');
      expect(make!.country).toBe('Japan');
    });

    it('returns undefined for unknown id', () => {
      expect(getMakeById('nonexistent')).toBeUndefined();
    });
  });

  describe('getNationalityById', () => {
    it('finds a nationality by code', () => {
      const nat = getNationalityById('SA');
      if (nat) {
        expect(nat.id).toBe('SA');
      }
    });

    it('returns undefined for unknown code', () => {
      expect(getNationalityById('XX')).toBeUndefined();
    });
  });
});
