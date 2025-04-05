import express from 'express';
import { registerRoutes } from './routes';
import "./migrations";
import { serveStatic } from './vite';
import { setupVite } from './vite';

const server = express();
const log = console.log;

server.use(express.json());
server.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  next();
});

// Ensure Content-Type is application/json for all API routes
server.use('/api', (req, res, next) => {
  if (!req.is('application/json')) {
    return res.status(406).json({ error: "API endpoints only accept application/json" });
  }
  next();
});

if (process.env.NODE_ENV === 'production') {
  serveStatic(server);
  const httpServer = await registerRoutes(server);
  const port = 5000;
  server.listen(port, '0.0.0.0', () => {
    log(`Production server running at http://0.0.0.0:${port}`);
  }).on('error', (err) => {
    log('Server error:', err);
  });
} else {
  const httpServer = await registerRoutes(server);
  await setupVite(server, httpServer);
  const port = 5000;
  server.listen(port, '0.0.0.0', () => {
    log(`Development server running at http://0.0.0.0:${port}`);
  }).on('error', (err) => {
    log('Server error:', err);
  });
}