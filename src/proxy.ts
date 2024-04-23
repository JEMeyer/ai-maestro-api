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
import { fetchModelToServerMapping } from './utilities/configuration';

const app = express();
app.use(express.json());
const serverStatus = new ServerStatus();

// In-memory storage for the model-to-server mapping
let modelToServerMap: Record<string, string> = {};

// Custom router function to determine the target server based on the model
const modelRouter = (req: IncomingMessage) => {
  const expressReq = req as express.Request;
  if (expressReq.path === '/api/completions') {
    const completionReq = expressReq.body as GenerateRequest;
    return modelToServerMap[completionReq.model];
  } else if (expressReq.path === '/api/chat') {
    const chatReq = expressReq.body as ChatRequest;
    return modelToServerMap[chatReq.model];
  } else if (expressReq.path === '/api/embeddings') {
    const embeddingReq = expressReq.body as EmbeddingsRequest;
    return modelToServerMap[embeddingReq.model];
  }
  return undefined;
};

// Custom middleware to handle queuing
const queueMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const targetServer = modelRouter(req);
  if (targetServer) {
    if (serverStatus.isServerBusy(targetServer)) {
      // If the target server is busy, wait for a short interval and retry
      setTimeout(() => {
        queueMiddleware(req, res, next);
      }, 100);
    } else {
      // If the target server is available, mark it as busy and proceed
      serverStatus.markServerBusy(targetServer);
      next();
    }
  } else {
    // If no target server is found, proceed with the request
    next();
  }
};

// Proxy middleware options
const proxyOptions: Options = {
  changeOrigin: true,
  router: modelRouter,
  selfHandleResponse: true, // Required for responseInterceptor to work
  on: {
    proxyRes: responseInterceptor(async (responseBuffer, _proxyRes, req) => {
      // Mark the server as available when the response is received
      const targetServer = modelRouter(req);
      if (targetServer != null) {
        serverStatus.markServerAvailable(targetServer);
      }
      return responseBuffer; // Return the original response buffer
    }),
  },
};

// Create the proxy middleware
const proxy = createProxyMiddleware(proxyOptions);

// Apply the queue middleware and proxy middleware to the specific endpoints
app.use('/api/completions', queueMiddleware, proxy);
app.use('/api/chat', queueMiddleware, proxy);
app.use('/api/embeddings', queueMiddleware, proxy);

// Endpoint to refresh the mapping
app.post('/refresh-mapping', async (_req, res) => {
  modelToServerMap = await fetchModelToServerMapping();
  res.sendStatus(200);
});

// Start the server
const port = 11434;
app.listen(port, () => {
  console.log(`Load balancer server is running on port ${port}`);
});
