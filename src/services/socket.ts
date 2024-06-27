import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { redis, redisSubscriber } from './redis';

const setupWebSocket = (server: HttpServer) => {
  const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',');

  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // Check if the origin is in the allowed list or is a local IP address
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
  });

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('subscribeToChannel', (channelName: string) => {
      redisSubscriber.subscribe(channelName, (err, count) => {
        if (err) {
          console.error('Failed to subscribe:', err.message);
          return;
        }
        console.log(`Subscribed to ${count} channel(s).`);
      });

      redisSubscriber.on('message', (channel, message) => {
        if (channel === channelName) {
          socket.emit('ReceiveMessage', { channel, message });
        }
      });
    });

    socket.on('publishToChannel', ({ channelName, message }) => {
      redis.publish(channelName, message);
    });

    socket.on('getKeyValuePairsByPattern', async (pattern) => {
      try {
        const keys = await redis.keys(pattern);
        const result: Record<string, string> = {};

        for (const key of keys) {
          const value = await redis.get(key);
          result[key] = value ?? '';
        }

        console.log('Emitting keyValuePairs:', result); // Debugging log
        socket.emit('keyValuePairs', result);
      } catch (error) {
        console.error('Error fetching key-value pairs:', error);
        socket.emit('keyValuePairs', {});
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
};

export default setupWebSocket;
