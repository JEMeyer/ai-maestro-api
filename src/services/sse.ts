import { Express } from 'express';
import { pubSubClient } from './redis';

export const setupSSE = (app: Express) => {
  app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.flushHeaders();

    res.write(': init\n\n');

    // Send heartbeat every 10 seconds to keep the connection open
    const heartbeatInterval = setInterval(() => {
      res.write(': ping\n\n');
    }, 10000);

    const handleMessage = (message: string) => {
      console.log(`[${new Date().toISOString()}] Sending message: ${message}`);
      res.write(`data: ${message}\n\n`);
    };

    pubSubClient.subscribe('gpu-lock-changes', (message) => {
      console.log(`[${new Date().toISOString()}] Received message: ${message}`);
      handleMessage(message);
    });

    req.on('close', () => {
      console.log(`[${new Date().toISOString()}] unsubscribing from redis.`);
      pubSubClient.unsubscribe('gpu-lock-changes', handleMessage);
      clearInterval(heartbeatInterval);
      res.end();
    });
  });
};
