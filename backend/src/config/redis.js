const { Redis } = require("@upstash/redis");

let redis;

if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch (error) {
    console.error("Failed to initialize Upstash Redis:", error.message);
  }
}

if (!redis) {
  console.warn("Upstash Redis not configured or failed to initialize — falling back to no-op cache");
  redis = {
    get: async () => null,
    set: async () => "OK",
    incr: async () => 1,
  };
}

module.exports = redis;
