import app from './app';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server successfully running in local dev mode on http://localhost:${PORT}`);
});

// Graceful Shutdown Handler
const shutdown = () => {
  console.log('Shutting down local server gracefully...');
  server.close(() => {
    console.log('Server process terminated.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
