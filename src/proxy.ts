// main.ts
import express from 'express';
import {
  createProxyMiddleware,
  Options,
  responseInterceptor,
} from 'http-proxy-middleware';
import { GenerateRequest, ChatRequest, EmbeddingsRequest } from 'ollama';
import { ServerStatus } from './utilities/serverStatus';
import { IncomingMessage } from 'http';
import { reserveServer } from './utilities/configuration';

const app = express();
app.use(express.json());
const serverStatus = new ServerStatus();

// Custom router function to determine the target server based on the model
const modelRouter = (req: IncomingMessage): string | undefined => {
  const expressReq = req as express.Request;
  let targetServer: string | undefined;

  if (expressReq.path === '/api/completions') {
    const completionReq = expressReq.body as GenerateRequest;
    targetServer = reserveServer(completionReq.model);
  } else if (expressReq.path === '/api/chat') {
    const chatReq = expressReq.body as ChatRequest;
    targetServer = reserveServer(chatReq.model);
  } else if (expressReq.path === '/api/embeddings') {
    const embeddingReq = expressReq.body as EmbeddingsRequest;
    targetServer = reserveServer(embeddingReq.model);
  }

  if (targetServer === undefined) {
    // If no available server is found, wait for a short interval and retry
    setTimeout(() => {
      modelRouter(req);
    }, 500);
  }

  return targetServer;
};

// Proxy middleware options
const proxyOptions: Options = {
  changeOrigin: true,
  router: modelRouter,
  selfHandleResponse: true, // Required for responseInterceptor to work
  on: {
    proxyRes: responseInterceptor(async (responseBuffer, proxyRes) => {
      // Get the target server's IP address and port from the proxyRes object
      const targetServerAddress = proxyRes.socket.remoteAddress;
      const targetServerPort = proxyRes.socket.remotePort;

      // Mark the server as available using the IP address and port
      serverStatus.markServerAvailable(
        `${targetServerAddress}:${targetServerPort}`
      );

      return responseBuffer; // Return the original response buffer
    }),
  },
};

// Create the proxy middleware
const proxy = createProxyMiddleware(proxyOptions);

// Apply the queue middleware and proxy middleware to the specific endpoints
app.use('/api/completions', proxy);
app.use('/api/chat', proxy);
app.use('/api/embeddings', proxy);

// Start the server
const port = 11434;
app.listen(port, () => {
  console.log(`Load balancer server is running on port ${port}`);
});
