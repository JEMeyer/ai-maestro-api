import { Express } from 'express';
import { pubSubClient } from './redis';

export const setupSSE = (app: Express) => {
  app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    res.flushHeaders();

    res.write(': init\n\n');

    // Send heartbeat every 15 seconds to keep the connection open (for cloudflare maybe? just in case)
    const heartbeatInterval = setInterval(() => {
      res.write(': ping\n\n');
    }, 15000);

    const handleMessage = (message: string) => {
      console.log(`[${new Date().toISOString()}] Sending message: ${message}`);
      res.write(`data: ${message}\n\n`);
      res.write(': ping\n\n'); // Send a ping flush the message
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
