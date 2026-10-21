const HTTP_METHODS = ['get', 'post', 'put', 'delete'];

export function createRouteApp() {
  const routes = {};
  const app = {};
  for (const method of HTTP_METHODS) {
    app[method] = (path, ...handlers) => {
      routes[`${method.toUpperCase()} ${path}`] = handlers;
    };
  }
  return { app, routes };
}

export function createRes() {
  const res = { statusCode: 200, body: undefined };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.body = payload;
    return res;
  };
  return res;
}

export function createReq(overrides = {}) {
  return { body: {}, query: {}, params: {}, headers: {}, ip: '203.0.113.7', ...overrides };
}

export function createDb(collections = {}) {
  return { collection: (name) => collections[name] };
}

export function createCollection(overrides = {}) {
  return {
    findOne: async () => null,
    updateOne: async () => ({}),
    insertOne: async () => ({}),
    deleteOne: async () => ({}),
    deleteMany: async () => ({}),
    countDocuments: async () => 0,
    ...overrides,
  };
}

export async function callRoute(routes, key, req, res = createRes()) {
  const handlers = routes[key];
  await handlers[handlers.length - 1](req, res);
  return res;
}
