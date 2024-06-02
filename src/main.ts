import * as childProcess from 'child_process';

// Start the proxy server
const proxyProcess = childProcess.spawn('node', ['dist/proxy.js'], {
  stdio: 'inherit',
});

// Start the web API server
const webApiProcess = childProcess.spawn('node', ['dist/web-api.js'], {
  stdio: 'inherit',
});

// Handle process exit
proxyProcess.on('exit', (code) => {
  console.log(`Proxy server exited with code ${code}`);
});

webApiProcess.on('exit', (code) => {
  console.log(`Web API server exited with code ${code}`);
});
