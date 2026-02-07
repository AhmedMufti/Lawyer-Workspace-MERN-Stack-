const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorMiddleware = require('./middleware/errorMiddleware');
const AppError = require('./utils/appError');
const socketHandler = require('./socketHandler');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Trust proxy (required for rate limiting behind proxies like Nginx/Heroku/Render)
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Set security HTTP headers
app.use(helmet());

// Rate limiting - prevents brute force attacks
const limiter = rateLimit({
  max: 100, // Limit each IP to 100 requests per windowMs
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to all routes
app.use('/api', limiter);

// Stricter rate limiting for authentication routes
const authLimiter = rateLimit({
  max: 5, // 5 login attempts
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ============================================
// GENERAL MIDDLEWARE
// ============================================

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://heroic-creponne-19a97d.netlify.app',
    'https://earnest-praline-2c72a6.netlify.app',
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true, // Allow cookies
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// HTTP request logger (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Serve static files
app.use('/uploads', express.static('uploads'));

// ============================================
// ROUTES
// ============================================

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Pakistan Legal Nexus API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Import route files
const authRoutes = require('./routes/authRoutes');
const caseRoutes = require('./routes/caseRoutes');
const documentRoutes = require('./routes/documentRoutes');
const hearingRoutes = require('./routes/hearingRoutes');
// const notificationRoutes = require('./routes/notificationRoutes'); // TODO: Create notification routes
const pollRoutes = require('./routes/pollRoutes');
const chatRoutes = require('./routes/chatRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const researchRoutes = require('./routes/researchRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');

// Use routes
console.log('MOUNTING AUTH ROUTES');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/hearings', hearingRoutes);
// app.use('/api/notifications', notificationRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Pakistan Legal Nexus API is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: 11,
      cases: 13,
      documents: 9,
      hearings: 10,
      research: 21,
      marketplace: 8,
      chat: 2,
      polls: 5,
      payments: 4
    },
    total: 83
  });
});

// Root route to clarify API paths
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Pakistan Legal Nexus API',
    documentation: 'API endpoints are available at /api/*',
    health_check: '/api/health'
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Global error handling middleware
app.use(errorMiddleware);

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('=========================================');
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API: http://localhost:${PORT}/api/health`);
  console.log('=========================================');
  console.log('=========================================');
});

// Initialize Socket.io
try {
  socketHandler.init(server);
  console.log('Socket.io initialized successfully');
} catch (error) {
  console.error('Failed to initialize Socket.io:', error);
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

module.exports = app;
