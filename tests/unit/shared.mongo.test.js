import { describe, it, expect, vi, afterEach } from 'vitest';

const clientState = vi.hoisted(() => ({ url: null, options: null }));

vi.mock('mongodb', () => ({
  MongoClient: class {
    constructor(url, options) {
      clientState.url = url;
      clientState.options = options;
    }
    async connect() {}
    db() {
      return {};
    }
    async close() {}
  },
}));

const { mongoConnect } = await import('#src/shared/mongo.js');

describe('shared/mongo.js', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('ignores undefined values so an undefined filter never matches everything', async () => {
    vi.stubEnv('MONGO_HOST', 'localhost:27017');
    vi.stubEnv('MONGO_DB', 'app');

    await mongoConnect();

    expect(clientState.options.ignoreUndefined).toBe(true);
  });

  it('defaults the protocol to mongodb when MONGO_TYPE is unset', async () => {
    vi.stubEnv('MONGO_TYPE', '');
    vi.stubEnv('MONGO_USER', '');
    vi.stubEnv('MONGO_HOST', 'localhost:27017');
    vi.stubEnv('MONGO_DB', 'app');

    await mongoConnect();

    expect(clientState.url).toBe('mongodb://localhost:27017/app');
  });

  it('keeps an explicit MONGO_TYPE and encodes credentials', async () => {
    vi.stubEnv('MONGO_TYPE', 'mongodb+srv');
    vi.stubEnv('MONGO_USER', 'us er');
    vi.stubEnv('MONGO_PWD', 'p@ss');
    vi.stubEnv('MONGO_HOST', 'cluster.example.net');
    vi.stubEnv('MONGO_DB', 'app');

    await mongoConnect();

    expect(clientState.url).toBe('mongodb+srv://us%20er:p%40ss@cluster.example.net/app');
  });
});
