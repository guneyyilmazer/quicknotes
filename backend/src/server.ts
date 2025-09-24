import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from 'dotenv';
import { usersRouter } from './users/routes';
import { notesRouter } from './notes/routes';

// Load environment variables
config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '3001');
const INSTANCE_ID: string = process.env.INSTANCE_ID || 'api-unknown';
const NODE_ENV: string = process.env.NODE_ENV || 'development';

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Routes
app.use('/api/auth', usersRouter);
app.use('/api/notes', notesRouter);

// Basic health check endpoint
app.get('/health', (req: Request, res: Response) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    instance: INSTANCE_ID,
    uptime: process.uptime(),
    environment: NODE_ENV,
    memory: process.memoryUsage(),
    version: process.version
  };
  
  res.json(healthData);
});

// Basic metrics endpoint (placeholder for Prometheus)
app.get('/metrics', (req: Request, res: Response) => {
  res.set('Content-Type', 'text/plain');
  const metrics = `# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{instance="${INSTANCE_ID}",method="GET"} 1

# HELP nodejs_memory_usage_bytes Node.js memory usage in bytes
# TYPE nodejs_memory_usage_bytes gauge
nodejs_memory_usage_bytes{instance="${INSTANCE_ID}",type="rss"} ${process.memoryUsage().rss}
nodejs_memory_usage_bytes{instance="${INSTANCE_ID}",type="heapTotal"} ${process.memoryUsage().heapTotal}
nodejs_memory_usage_bytes{instance="${INSTANCE_ID}",type="heapUsed"} ${process.memoryUsage().heapUsed}

# HELP nodejs_uptime_seconds Node.js uptime in seconds
# TYPE nodejs_uptime_seconds gauge
nodejs_uptime_seconds{instance="${INSTANCE_ID}"} ${process.uptime()}
`;
  
  res.send(metrics);
});

// API status endpoint
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    message: 'QuickNotes API is running!',
    instance: INSTANCE_ID,
    version: '1.0.0',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API routes placeholder
app.get('/api/v1/test', (req: Request, res: Response) => {
  res.json({
    message: 'API v1 test endpoint working',
    instance: INSTANCE_ID,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
interface CustomError extends Error {
  status?: number;
}

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.stack);
  
  const status = err.status || 500;
  const message = NODE_ENV === 'production' 
    ? 'Something went wrong!' 
    : err.message;
  
  res.status(status).json({ 
    error: message,
    instance: INSTANCE_ID,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method,
    instance: INSTANCE_ID,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 QuickNotes API [${INSTANCE_ID}] running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Metrics: http://localhost:${PORT}/metrics`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
}); 