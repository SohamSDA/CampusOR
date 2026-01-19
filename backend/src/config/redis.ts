import Redis from "ioredis";
import { env } from "./env.js";

let redisClient: Redis | null = null;
let redisReady = false;
let redisReadyLogged = false;

export const initializeRedis = (): void => {
  if (redisClient) return;

  redisClient = new Redis(env.REDIS_URL, {
    enableReadyCheck: true,
    maxRetriesPerRequest: 1,
    lazyConnect: false,
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
