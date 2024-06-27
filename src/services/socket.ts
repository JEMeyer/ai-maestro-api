import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { redis, redisSubscriber } from './redis';

const setupWebSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
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

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
};

export default setupWebSocket;
