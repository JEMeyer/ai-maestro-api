import { createClient } from 'redis';

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

const pubSubClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

redisClient.connect().catch(console.error);
pubSubClient.connect().catch(console.error);

export { redisClient, pubSubClient };
