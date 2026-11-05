require("dotenv").config();

const redis = require("./config/redis");

async function pingRedis() {
  try {
    console.log("Connecting to Redis...");

    const response = await redis.ping();

    console.log("\nREDIS CONNECTION:", response);

    const projectKeys = await redis.keys("projects:*");

    const taskKeys = await redis.keys("tasks:*");

    // Check future dashboard cache keys
    const dashboardKeys = await redis.keys("dashboard:*");

    console.log("\n========== REDIS CACHE REPORT ==========");

    console.log("\nPROJECTS API");
    console.log("Total Keys:", projectKeys.length);
    console.log(projectKeys);

    console.log("\nTASKS API");
    console.log("Total Keys:", taskKeys.length);
    console.log(taskKeys);

    console.log("\nDASHBOARD API");
    console.log("Total Keys:", dashboardKeys.length);
    console.log(dashboardKeys);

    console.log("\n========================================");
  } catch (error) {
    console.error("REDIS ERROR:", error);
  }
}

pingRedis();
