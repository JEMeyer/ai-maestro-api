import { Express } from 'express';
import { pubSubClient } from './redis';

export const setupSSE = (app: Express) => {
  app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const handleMessage = (message: string) => {
      res.write(`data: ${message}\n\n`);
    };

    pubSubClient.subscribe('gpu-lock-changes', (message) => {
      console.log('passing along channel update with message: ', message);
      handleMessage(message);
    });

    req.on('close', () => {
      pubSubClient.unsubscribe('gpu-lock-changes', handleMessage);
      res.end();
    });
  });
};
