import { Redis } from "ioredis";
import { env } from "./env.js";

let redisClient: Redis | null = null;
let redisReady = false;
let redisReadyLogged = false;

export const initializeRedis = (): void => {
  if (redisClient) return;

  redisClient = new Redis(env.REDIS_URL, {
    enableReadyCheck: true,
    maxRetriesPerRequest: 1,
    lazyConnect: true, // Don't crash on startup if missing
    retryStrategy: (times) => {
      // Exponential backoff: 2s, 4s, 8s, ... max 60s
      const delay = Math.min(times * 2000, 60000);
      return delay;
    },
  });

  redisClient.on("ready", () => {
    redisReady = true;
    if (!redisReadyLogged) {
      console.info("✅ Redis connected and ready");
      redisReadyLogged = true;
    }
  });

  redisClient.on("error", (error) => {
    redisReady = false;
    console.warn("⚠️ Redis error (fallback to MongoDB):", error);
  });

  redisClient.on("end", () => {
    redisReady = false;
    console.warn("⚠️ Redis connection closed (fallback to MongoDB)");
  });
};

export const getRedisClient = (): Redis | null => redisClient;

export const isRedisReady = (): boolean => redisReady;

