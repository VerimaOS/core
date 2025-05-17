import express from 'express';
import { ethers } from 'ethers';
import { ProductAPI } from './api/ProductAPI';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Environment variables
const PORT = process.env.PORT || 3000;
const IPFS_NODE_URL = process.env.IPFS_NODE_URL || 'http://localhost:5001';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PROVIDER_URL = process.env.PROVIDER_URL || 'http://localhost:8545';

if (!CONTRACT_ADDRESS) {
  throw new Error('CONTRACT_ADDRESS environment variable is required');
}

// Setup blockchain provider
const provider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);

// Initialize API
const productAPI = new ProductAPI(
  IPFS_NODE_URL,
  CONTRACT_ADDRESS,
  provider
);

// Setup routes
app.use('/api', productAPI.getRouter());

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
  console.log(`Contract Address: ${CONTRACT_ADDRESS}`);
  console.log(`Provider URL: ${PROVIDER_URL}`);
}); 