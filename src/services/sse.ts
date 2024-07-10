import { Express } from 'express';
import { pubSubClient } from './redis';

export const setupSSE = (app: Express) => {
  app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.flushHeaders();

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
      res.end();
    });
  });
};
