const redis = require("../config/redis");

const PROJECT_CACHE_VERSION_KEY = "cache:projects:version";
const TASK_CACHE_VERSION_KEY = "cache:tasks:version";
const DASHBOARD_CACHE_VERSION_KEY = "cache:dashboard:version";

const invalidateCache = async (key, cacheName) => {
  try {
    await redis.incr(key);

    console.log(`${cacheName} cache invalidated`);
  } catch (error) {
    console.error(`${cacheName} cache invalidation error:`, error);
  }
};

const invalidateProjectsCache = async () => {
  await invalidateCache(PROJECT_CACHE_VERSION_KEY, "Projects");
};

const invalidateTasksCache = async () => {
  await invalidateCache(TASK_CACHE_VERSION_KEY, "Tasks");
};

const invalidateDashboardCache = async () => {
  await invalidateCache(DASHBOARD_CACHE_VERSION_KEY, "Dashboard");
};

const invalidateProjectRelatedCaches = async () => {
  await Promise.all([
    invalidateProjectsCache(),
    invalidateTasksCache(),
    invalidateDashboardCache(),
  ]);
};

const invalidateTaskRelatedCaches = async () => {
  await Promise.all([invalidateTasksCache(), invalidateDashboardCache()]);
};


module.exports = {
  PROJECT_CACHE_VERSION_KEY,
  TASK_CACHE_VERSION_KEY,
  DASHBOARD_CACHE_VERSION_KEY,
  invalidateProjectsCache,
  invalidateTasksCache,
  invalidateDashboardCache,
  invalidateProjectRelatedCaches,
  invalidateTaskRelatedCaches,
};
