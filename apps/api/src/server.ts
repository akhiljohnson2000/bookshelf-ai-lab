import { createApp } from './app.js';
import { config } from './config/index.js';

const app = createApp();

app.listen(config.port, () => {
  console.log(`API server running at http://localhost:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`API base path: ${config.apiBasePath}`);
});
