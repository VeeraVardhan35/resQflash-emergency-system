import jwt from 'jsonwebtoken';
import { v7 as uuidv7 } from 'uuid';
import redis from '../config/redis.js';
import logger from '../config/logger.js';
import { JWT_ACCESS_EXPIRES, JWT_ACCESS_SECRET, JWT_REFRESH_EXPIRES, JWT_REFRESH_SECRET } from '../config/env.js';

const REFRESH_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      tokenVersion: user.refreshTokenVersion,
    },
    JWT_ACCESS_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRES }
  );
};

export const generateRefreshToken = (user) => {
  const jti = uuidv7();
  const token = jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      tokenVersion: user.refreshTokenVersion,
      jti,
    },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES }
  );
  return { token, jti };
};

export const storeRefreshToken = async (userId, jti) => {
  const key = `refresh:${userId}:${jti}`;
  await redis.set(key, 'valid', 'EX', REFRESH_TTL);
  logger.debug('Refresh token stored', { userId, jti });
};

export const validateRefreshTokenInRedis = async (userId, jti) => {
  const key = `refresh:${userId}:${jti}`;
  const value = await redis.get(key);
  return value === 'valid';
};

export const deleteRefreshToken = async (userId, jti) => {
  const key = `refresh:${userId}:${jti}`;
  await redis.del(key);
  logger.debug('Refresh token deleted', { userId, jti });
};

export const deleteAllRefreshTokens = async (userId) => {
  const pattern = `refresh:${userId}:*`;
  let cursor = '0';
  const keys = [];

  do {
    const [nextCursor, found] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
    cursor = nextCursor;
    keys.push(...found);
  } while (cursor !== '0');

  if (keys.length > 0) {
    await redis.del(...keys);
    logger.info(`Deleted ${keys.length} refresh tokens for user`, { userId });
  }
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_ACCESS_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};