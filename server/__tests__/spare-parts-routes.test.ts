import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Spare part read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const sparePartRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/spare-parts.ts'), 'utf-8');

  it('mounts the extracted spare part router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import sparePartRoutes from ['"]\.\/spare-parts['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*sparePartRoutes\)/);
  });

  it('removes active spare part read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/spare-parts['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/spare-parts\/:id['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/spare-part-inventories['"]/);
  });

  it('leaves mutating spare part handlers in legacy routes for existing audit coverage', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/spare-parts['"]/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/spare-parts\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.delete\(['"]\/api\/spare-parts\/:id['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/spare-part-inventories['"]/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/spare-part-inventories\/:id['"]/);
  });

  it('preserves spare part list pagination, garage scoping, and detail lookup', () => {
    expect(sparePartRoutesSource).toMatch(/router\.get\(['"]\/spare-parts['"],\s*isAuthenticated/);
    expect(sparePartRoutesSource).toMatch(/parsePagination\(req\)/);
    expect(sparePartRoutesSource).toMatch(/const gid = \(garageId as string\) \|\| \(req\.user as any\)\?\.garageId/);
    expect(sparePartRoutesSource).toMatch(/storage\.getSparePartsPaginated\(gid,\s*pagination\.limit,\s*pagination\.offset\)/);
    expect(sparePartRoutesSource).toMatch(/storage\.countSpareParts\(gid\)/);
    expect(sparePartRoutesSource).toMatch(/sendPaginated\(res,\s*data,\s*total,\s*pagination,\s*pagination\.explicit\)/);
    expect(sparePartRoutesSource).toMatch(/router\.get\(['"]\/spare-parts\/:id['"],\s*isAuthenticated/);
    expect(sparePartRoutesSource).toMatch(/storage\.getSparePart\(id\)/);
    expect(sparePartRoutesSource).toMatch(/Spare part not found/);
  });

  it('preserves spare part inventory read validation and storage lookup', () => {
    expect(sparePartRoutesSource).toMatch(/router\.get\(['"]\/spare-part-inventories['"],\s*isAuthenticated/);
    expect(sparePartRoutesSource).toMatch(/const \{ garage_id,\s*spare_part_id \} = req\.query/);
    expect(sparePartRoutesSource).toMatch(/if \(!garage_id\)/);
    expect(sparePartRoutesSource).toMatch(/garage_id is required/);
    expect(sparePartRoutesSource).toMatch(/storage\.getSparePartInventories\(\s*garage_id as string,\s*spare_part_id as string,\s*\)/);
  });
});
