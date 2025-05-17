import express, { Request, Response, Router } from 'express';
import { ProductAPI } from './ProductAPI';
import { ProductData } from '../storage/IPFSService';

export function createProductRouter(productAPI: ProductAPI): Router {
  const router = express.Router();

  // Create new digital passport
  router.post('/passport', async (req: Request, res: Response) => {
    try {
      const productData: ProductData = req.body;
      const ipfsHash = await productAPI.createProduct(productData);
      
      res.status(201).json({
        message: 'Digital passport created successfully',
        ipfsHash,
      });
    } catch (error) {
      res.status(500).json({ error: `Failed to create digital passport: ${error}` });
    }
  });

  // Get product data
  router.get('/passport/:ipfsHash', async (req: Request, res: Response) => {
    try {
      const ipfsHash = req.params.ipfsHash;
      const productData = await productAPI.getProductDetails(ipfsHash);

      if (!productData) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({
        ipfsHash,
        productData
      });
    } catch (error) {
      res.status(500).json({ error: `Failed to retrieve product data: ${error}` });
    }
  });

  // Update product data
  router.put('/passport/:tokenId', async (req: Request, res: Response) => {
    try {
      const tokenId = req.params.tokenId;
      const updatedData: ProductData = req.body;
      
      await productAPI.updateProduct(tokenId, updatedData);

      res.json({
        message: 'Product data updated successfully',
        tokenId,
      });
    } catch (error) {
      res.status(500).json({ error: `Failed to update product data: ${error}` });
    }
  });

  // Verify product authenticity
  router.post('/verify/:tokenId', async (req: Request, res: Response) => {
    try {
      const tokenId = req.params.tokenId;
      const { verified } = req.body;

      await productAPI.verifyProduct(tokenId, verified);

      res.json({
        message: 'Product verification updated successfully',
        tokenId,
        verified
      });
    } catch (error) {
      res.status(500).json({ error: `Failed to verify product: ${error}` });
    }
  });

  return router;
} 