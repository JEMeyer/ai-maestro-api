import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

const setupWebSocket = async (server: HttpServer) => {
  const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',');

  const pubClient = createClient({ url: `redis://${redisHost}:${redisPort}` });
  const subClient = pubClient.duplicate();

  await pubClient.connect();
  await subClient.connect();

  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (
          !origin ||
          allowedOrigins.includes(origin) ||
          /^http:\/\/localhost:\d+$/.test(origin) ||
          /^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin)
        ) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingInterval: 25000, // Send a ping every 25 seconds
    pingTimeout: 30000, // Disconnect if no pong is received within 30 seconds
  });

  io.adapter(createAdapter(pubClient, subClient));

  io.on('connection', (socket) => {
    console.log('New client connected');
    const subscribedChannels = new Set<string>();

    let lastActivityTime = Date.now();

    // Update last activity time on any socket event
    socket.onAny(() => {
      lastActivityTime = Date.now();
    });

    const interval = setInterval(() => {
      if (Date.now() - lastActivityTime > 30000) {
        console.log('Disconnecting due to inactivity');
        socket.disconnect(true);
        clearInterval(interval);
      }
    }, 5000); // Check every 5 seconds

    socket.on('subscribeToChannel', async (channelName: string) => {
      if (!subscribedChannels.has(channelName)) {
        subscribedChannels.add(channelName);
        subClient.subscribe(channelName, (err) => {
          if (err) {
            console.error(
              `Failed to subscribe to channel ${channelName}:`,
              err.message
            );
          } else {
            console.log(`Subscribed to channel ${channelName}`);
          }
        });
      }
    });

    subClient.on('message', (channel, message) => {
      if (subscribedChannels.has(channel)) {
        socket.emit('ReceiveMessage', { channel, message });
      }
    });

    socket.on('publishToChannel', async ({ channelName, message }) => {
      try {
        await pubClient.publish(channelName, message);
        console.log(`Published message to channel ${channelName}`);
      } catch (err) {
        console.error(
          `Failed to publish to channel ${channelName}:`,
          (err as Error).message
        );
      }
    });

    socket.on('getKeyValuePairsByPattern', async (pattern) => {
      try {
        const keys = await pubClient.keys(pattern);
        const result: Record<string, string> = {};
        for (const key of keys) {
          const value = await pubClient.get(key);
          result[key] = value ?? '';
        }
        socket.emit('keyValuePairs', result);
      } catch (error) {
        console.error(
          'Error fetching key-value pairs:',
          (error as Error).message
        );
        socket.emit('keyValuePairs', {});
      }
    });

    socket.on('disconnect', () => {
      subscribedChannels.forEach((channel) => {
        subClient.unsubscribe(channel).catch((err) => {
          console.error(
            `Failed to unsubscribe from channel ${channel}:`,
            (err as Error).message
          );
        });
      });
      clearInterval(interval);
      console.log('Client disconnected');
    });
  });

  return io;
};

export default setupWebSocket;
