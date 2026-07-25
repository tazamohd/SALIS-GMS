import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Knowledge base read route extraction (Wave J)', () => {
  const legacyRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf-8');
  const hybridRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/index.ts'), 'utf-8');
  const knowledgeBaseRoutesSource = fs.readFileSync(path.resolve(process.cwd(), 'server/routes/knowledge-base.ts'), 'utf-8');

  it('mounts the extracted knowledge base router from the hybrid router', () => {
    expect(hybridRoutesSource).toMatch(/import knowledgeBaseRoutes from ['"]\.\/knowledge-base['"]/);
    expect(hybridRoutesSource).toMatch(/app\.use\(["']\/api["'],\s*knowledgeBaseRoutes\)/);
  });

  it('removes active knowledge base read handlers from the legacy monolith', () => {
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/knowledge-base\/categories['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/knowledge-base\/articles['"]/);
    expect(legacyRoutesSource).not.toMatch(/app\.get\(['"]\/api\/knowledge-base\/articles\/:id['"]/);
  });

  it('leaves knowledge base mutation handlers in legacy routes', () => {
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/knowledge-base\/categories['"]/);
    expect(legacyRoutesSource).toMatch(/app\.post\(['"]\/api\/knowledge-base\/articles['"]/);
    expect(legacyRoutesSource).toMatch(/app\.patch\(['"]\/api\/knowledge-base\/articles\/:id['"]/);
  });

  it('preserves category and article list behavior', () => {
    expect(knowledgeBaseRoutesSource).toMatch(/router\.get\(['"]\/knowledge-base\/categories['"],\s*isAuthenticated/);
    expect(knowledgeBaseRoutesSource).toMatch(/storage\.getArticleCategories\(\)/);
    expect(knowledgeBaseRoutesSource).toMatch(/router\.get\(['"]\/knowledge-base\/articles['"],\s*isAuthenticated/);
    expect(knowledgeBaseRoutesSource).toMatch(/req\.query\.categoryId as string/);
    expect(knowledgeBaseRoutesSource).toMatch(/req\.query\.isPublished === ['"]true['"]/);
    expect(knowledgeBaseRoutesSource).toMatch(/storage\.getKnowledgeArticles\(/);
  });

  it('preserves article detail view increment behavior', () => {
    expect(knowledgeBaseRoutesSource).toMatch(/router\.get\(['"]\/knowledge-base\/articles\/:id['"],\s*isAuthenticated/);
    expect(knowledgeBaseRoutesSource).toMatch(/storage\.getKnowledgeArticle\(req\.params\.id\)/);
    expect(knowledgeBaseRoutesSource).toMatch(/if \(article\)/);
    expect(knowledgeBaseRoutesSource).toMatch(/storage\.incrementArticleViews\(req\.params\.id\)/);
    expect(knowledgeBaseRoutesSource).toMatch(/res\.json\(\{ data: article \}\)/);
  });
});
