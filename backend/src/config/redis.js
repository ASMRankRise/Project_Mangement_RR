const { Redis } = require("@upstash/redis");

const TIMEOUT = 2000;
const RETRY_DELAY = 30000;

const configured =
  Boolean(process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN);

const client = configured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

let unavailableUntil = 0;

if (!configured) {
  console.warn("Redis not configured. Using MongoDB fallback.");
}

const execute = async (method, args, fallback) => {
  if (!client) return fallback;

  const now = Date.now();
  if (now < unavailableUntil) {
    return fallback;
  }

  let timeoutId;
  try {
    const result = await Promise.race([
      client[method](...args),
      new Promise((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error("Redis request timed out")),
          TIMEOUT
        );
      }),
    ]);
    return result;
  } catch (error) {
    unavailableUntil = Date.now() + RETRY_DELAY;
    console.warn(`Redis connection error (${error.message}). Bypassing cache for 30s.`);
    return fallback;
  } finally {
    clearTimeout(timeoutId);
  }
};

module.exports = {
  get: (...args) => execute("get", args, null),
  set: (...args) => execute("set", args, "OK"),
  incr: (...args) => execute("incr", args, 1),
};
