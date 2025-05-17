import express from 'express';
import { IPFSService } from './storage/IPFSService';
import { ProductAPI } from './api/ProductAPI';
import { createProductRouter } from './api/routes';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const IPFS_NODE_URL = process.env.IPFS_NODE_URL || 'http://localhost:5001';

// Initialize services
const ipfsService = new IPFSService(IPFS_NODE_URL);
const productAPI = new ProductAPI(ipfsService);

// Middleware
app.use(express.json());

// Routes
app.use('/api', createProductRouter(productAPI));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy' });
});

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`IPFS Node URL: ${IPFS_NODE_URL}`);
}); 