import { createSitemapCache } from '#src/shared/sitemap.js';
import {
  ROBOTS_DISALLOWED_PATHS,
  ROBOTS_CACHE_MAX_AGE_SECONDS,
  SITEMAP_CACHE_MAX_AGE_SECONDS,
} from '#src/shared/seoConstants.js';

export function buildRobotsTxt(siteUrl) {
  const disallowed = ROBOTS_DISALLOWED_PATHS.map((path) => `Disallow: ${path}`).join('\n');
  return `User-agent: *\nAllow: /\n\n${disallowed}\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
}

export function setupSeoRoutes(app, { db, siteUrl }) {
  const sitemapCache = createSitemapCache({ siteUrl, db });

  app.get('/sitemap.xml', async (req, res) => {
    try {
      const { xml, generatedAt } = await sitemapCache.get();
      res
        .set({
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': `public, max-age=${SITEMAP_CACHE_MAX_AGE_SECONDS}`,
          'Last-Modified': new Date(generatedAt).toUTCString(),
        })
        .send(xml);
    } catch (err) {
      console.error('Sitemap error:', err);
      res.status(500).end();
    }
  });

  app.get('/robots.txt', (req, res) => {
    res
      .set({
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': `public, max-age=${ROBOTS_CACHE_MAX_AGE_SECONDS}`,
      })
      .send(buildRobotsTxt(siteUrl));
  });
}
