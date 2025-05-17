import express, { Request, Response, Router } from 'express';
import { ethers } from 'ethers';
import { IPFSService, ProductData } from '../storage/IPFSService';
import DigitalPassportABI from '../contracts/artifacts/DigitalPassport.json';

export class ProductAPI {
  private router: Router;
  private ipfsService: IPFSService;
  private contract: ethers.Contract;

  constructor(
    ipfsNodeUrl: string,
    contractAddress: string,
    provider: ethers.providers.Provider
  ) {
    this.router = express.Router();
    this.ipfsService = new IPFSService(ipfsNodeUrl);
    this.contract = new ethers.Contract(
      contractAddress,
      DigitalPassportABI.abi,
      provider
    );

    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Create new digital passport
    this.router.post('/passport', async (req: Request, res: Response) => {
      try {
        const productData: ProductData = req.body;
        const ipfsHash = await this.ipfsService.uploadProductData(productData);
        
        // Mint new passport token
        const tx = await this.contract.mintPassport(req.body.ownerAddress, ipfsHash);
        await tx.wait();

        res.status(201).json({
          message: 'Digital passport created successfully',
          ipfsHash,
          transactionHash: tx.hash
        });
      } catch (error) {
        res.status(500).json({ error: `Failed to create digital passport: ${error}` });
      }
    });

    // Get product data
    this.router.get('/passport/:tokenId', async (req: Request, res: Response) => {
      try {
        const tokenId = req.params.tokenId;
        const ipfsHash = await this.contract.getProductData(tokenId);
        const productData = await this.ipfsService.getProductData(ipfsHash);

        res.json({
          tokenId,
          ipfsHash,
          productData
        });
      } catch (error) {
        res.status(500).json({ error: `Failed to retrieve product data: ${error}` });
      }
    });

    // Update product data
    this.router.put('/passport/:tokenId', async (req: Request, res: Response) => {
      try {
        const tokenId = req.params.tokenId;
        const updatedData: ProductData = req.body;
        
        const newIpfsHash = await this.ipfsService.updateProductData(updatedData);
        const tx = await this.contract.updateProductData(tokenId, newIpfsHash);
        await tx.wait();

        res.json({
          message: 'Product data updated successfully',
          tokenId,
          newIpfsHash,
          transactionHash: tx.hash
        });
      } catch (error) {
        res.status(500).json({ error: `Failed to update product data: ${error}` });
      }
    });

    // Verify product authenticity
    this.router.get('/verify/:tokenId', async (req: Request, res: Response) => {
      try {
        const tokenId = req.params.tokenId;
        const exists = await this.contract.ownerOf(tokenId).then(() => true).catch(() => false);

        if (!exists) {
          return res.status(404).json({ verified: false, message: 'Product not found' });
        }

        const ipfsHash = await this.contract.getProductData(tokenId);
        const productData = await this.ipfsService.getProductData(ipfsHash);
        const owner = await this.contract.ownerOf(tokenId);

        res.json({
          verified: true,
          tokenId,
          owner,
          productData
        });
      } catch (error) {
        res.status(500).json({ error: `Failed to verify product: ${error}` });
      }
    });
  }

  getRouter(): Router {
    return this.router;
  }
} 