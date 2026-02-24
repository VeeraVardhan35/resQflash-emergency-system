import Redis from 'ioredis';
import {
  REDIS_URL,
  UPSTASH_REDIS_REST_TOKEN,
  UPSTASH_REDIS_REST_URL,
} from './env.js';
import logger from './logger.js';

const resolveRedisConfig = (rawValue = '') => {
  const extractedUrl = rawValue.match(/rediss?:\/\/\S+/i)?.[0];
  const url = extractedUrl || rawValue.trim();
  const useTls = url.startsWith('rediss://') || rawValue.includes('--tls');

  return { url, useTls };
};

const isUpstashRestConfigured = Boolean(
  UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN
);

const createUpstashRestClient = () => {
  const baseUrl = UPSTASH_REDIS_REST_URL.replace(/\/+$/, '');
  const authHeader = { Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}` };

  const execute = async (...commandParts) => {
    const commandPath = commandParts.map((part) => encodeURIComponent(String(part))).join('/');
    const endpoint = `${baseUrl}/${commandPath}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: authHeader,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.error) {
      throw new Error(payload.error || `Upstash REST error (${response.status})`);
    }
    return payload.result;
  };

  return {
    ping: async () => execute('PING'),
    set: async (key, value, mode, ttl) => {
      if (mode === 'EX' && Number.isFinite(Number(ttl))) {
        return execute('SET', key, value, 'EX', Number(ttl));
      }
      return execute('SET', key, value);
    },
    get: async (key) => execute('GET', key),
    del: async (...keys) => {
      if (keys.length === 0) return 0;
      return execute('DEL', ...keys);
    },
    scan: async (cursor, _matchKeyword, pattern, _countKeyword, count) => {
      const result = await execute('SCAN', cursor, 'MATCH', pattern, 'COUNT', count || 100);
      const nextCursor = Array.isArray(result) ? String(result[0]) : '0';
      const keys = Array.isArray(result) ? result[1] : [];
      return [nextCursor, keys];
    },
    on: () => {},
  };
};

const createIoredisClient = () => {
  const { url: redisUrl, useTls } = resolveRedisConfig(REDIS_URL);

  const client = new Redis(redisUrl, {
    tls: useTls ? {} : undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      if (times > 5) {
        logger.error('Redis retry limit exceeded.');
        return null;
      }
      return Math.min(times * 200, 2000);
    },
  });

  client.on('connect', () => logger.info('Redis connected'));
  client.on('error', (err) =>
    logger.error('Redis error', { error: err.message })
  );

  return client;
};

const redis = isUpstashRestConfigured ? createUpstashRestClient() : createIoredisClient();

export default redis;
