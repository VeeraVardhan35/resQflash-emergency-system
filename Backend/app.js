import  express  from "express";
import helmet from 'helmet';
import cookieParser from "cookie-parser";
import cors from 'cors';
import { CLIENT_URL, NODE_ENV, PORT } from "./config/env.js";
import logger from "./config/logger.js";
import { generalLimiter } from "./middlewares/rateLimit.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import connectDB from "./config/db.js";
import redis from './config/redis.js';

const app = express();

app.use(helmet());

app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(generalLimiter);

app.use('/api/auth/', authRoutes);
app.get('/', (req, res) => res.send("Welcome to the ResQFlash"));

app.use((err, req, res, next) => {
  void next;
  const statusCode = err.statusCode || 500;
  logger.error('Unhandled request error', {
    error: err.message,
    path: req.originalUrl,
    method: req.method,
    statusCode,
  });

  const payload = {
    success: false,
    message: err.message || 'Internal Server Error',
  };

  if (err.errors) payload.errors = err.errors;
  res.status(statusCode).json(payload);
});

(async () => {
  try {
    await connectDB();
    logger.info("MongoDB connected");

    await redis.ping();
    logger.info("Redis connected");

    app.listen(PORT, () => {
      logger.info(
        `Server running on http://localhost:${PORT} in ${NODE_ENV} mode`
      );
    });
  } catch (err) {
    logger.error("Startup error", { error: err.message });
    process.exit(1);
  }
})();

export default app;
