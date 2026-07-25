import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Service chat read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const serviceChatRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/service-chat.ts'), 'utf-8');

  it('mounts the extracted service chat router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import serviceChatRoutes from ['"]\.\/service-chat['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*serviceChatRoutes\)/);
  });

  it('removes the active service chat read handler from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/job-cards\/:jobCardId\/chat['"]/);
  });

  it('leaves the service chat write handler in legacy routes for existing write behavior', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/job-cards\/:jobCardId\/chat['"]/);
  });

  it('preserves the authenticated service chat read contract', () => {
    expect(serviceChatRoutesSource).toMatch(/router\.get\(['"]\/job-cards\/:jobCardId\/chat['"],\s*isAuthenticated/);
    expect(serviceChatRoutesSource).toMatch(/const \{ jobCardId \} = req\.params/);
    expect(serviceChatRoutesSource).toMatch(/storage\.getServiceChatMessages\(jobCardId\)/);
    expect(serviceChatRoutesSource).toMatch(/Failed to fetch chat messages/);
  });
});
