import { API_DEV_ROUTER_PATH } from '#src/api/http/constants.js';

export async function mountDevMiddlewares(app, { httpServer, db, base }) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true, hmr: { server: httpServer } },
    appType: 'custom',
    base,
  });

  app.use(async (req, res, next) => {
    if (!req.path.startsWith('/api')) return next();
    try {
      const { createApiRouter } = await vite.ssrLoadModule(API_DEV_ROUTER_PATH);
      return createApiRouter(db)(req, res, next);
    } catch (err) {
      vite.ssrFixStacktrace(err);
      return next(err);
    }
  });

  app.use(vite.middlewares);
  return vite;
}

export async function mountProductionApi(app, db) {
  const { createApiRouter } = await import('#src/api/router.js');
  app.use(createApiRouter(db));
}
