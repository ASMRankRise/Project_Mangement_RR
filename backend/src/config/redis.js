const { Redis } = require("@upstash/redis");

const redis = new Redis({
  url: "https://wired-dogfish-244328.upstash.io",
  token: "gQAAAAAAA7poAAIgcDE2OWYyMjkyNTFiYzk0OWNkYTY4ZGZlYjM2Y2NiMzRlOA",
});

module.exports = redis;
