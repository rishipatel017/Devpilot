import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);
export default redis;

// Key patterns:
// rate:userId:tool       → rate limit counter (TTL: 60s window)
// cache:hash(prompt)     → cached AI response (TTL: 1 hour)
// session:token          → user session data (TTL: 7 days)
