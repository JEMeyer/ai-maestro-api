import Redis from 'ioredis';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

const redis = new Redis({
  host: redisHost,
  port: redisPort,
});

const redisSubscriber = new Redis({
  host: redisHost,
  port: redisPort,
});

redisSubscriber.on('error', (err) => {
  console.error('Redis subscriber error:', err);
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

export { redis, redisSubscriber };
