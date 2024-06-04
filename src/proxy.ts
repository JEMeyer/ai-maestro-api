import express from 'express';
import {
  createProxyMiddleware,
  Options,
  responseInterceptor,
} from 'http-proxy-middleware';
import { Compute } from './utilities/computeStatus';
import { IncomingMessage } from 'http';
import { loadModelMapFromFile, reserveGPU } from './utilities/configuration';
import { loadConfigFile } from './services/database';

// Updates local copy of config
loadConfigFile();
loadModelMapFromFile();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Custom router function to determine the target server based on the model
const modelRouter = (req: IncomingMessage) => {
  const expressReq = req as express.Request;
  const targetServer = reserveGPU(expressReq.body.model);

  if (targetServer instanceof Error) return undefined;

  if (targetServer === undefined) {
    // If no available server is found, wait for a short interval and retry
    setTimeout(() => {
      return modelRouter(req);
    }, 300);
  }

  console.log(`${targetServer}${expressReq.originalUrl}`);

  return `${targetServer}${expressReq.originalUrl}`;
};

const handleResponse = async (responseBuffer: any, proxyRes: any) => {
  const targetServerAddress = proxyRes.socket.remoteAddress;
  const targetServerPort = proxyRes.socket.remotePort;

  // Now that the request is done, we can free up the gpu
  Compute.markAvailable(`${targetServerAddress}:${targetServerPort}`);
  return responseBuffer; // Return the original response buffer
};

const diffusionProxyOptions: Options = {
  changeOrigin: true,
  router: modelRouter,
  selfHandleResponse: true,
  on: {
    proxyRes: responseInterceptor(handleResponse),
  },
};

const ollamaProxyOptions: Options = {
  changeOrigin: true,
  router: modelRouter,
  selfHandleResponse: true, // Required for responseInterceptor to work
  on: {
    proxyReq: function (proxyReq, req) {
      // We need to modify only the ollama requests to enforce keep_alive
      const expressReq = req as express.Request;
      const bodyData = expressReq.body;
      bodyData['keep_alive'] = -1;
      const bodyString = JSON.stringify(bodyData);
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyString));
      proxyReq.write(bodyString);
    },
    proxyRes: responseInterceptor(handleResponse),
  },
};

// Create the proxy middleware
const ollamaProxy = createProxyMiddleware(ollamaProxyOptions);
const diffusionProxy = createProxyMiddleware(diffusionProxyOptions);

// Apply the proxy middleware to the specific endpoints
app.use('/api/completions', ollamaProxy);
app.use('/api/chat', ollamaProxy);
app.use('/api/embeddings', ollamaProxy);

// Note, we'll use the same port for the diffusion to consolidate apps for proxy
app.use('/txt2img', diffusionProxy);
app.use('/img2img', diffusionProxy);

// Start the server
const port = 11434;
app.listen(port, () => {
  console.log(`Load balancer server is running on port ${port}`);
});
