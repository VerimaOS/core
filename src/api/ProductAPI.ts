import { ethers } from 'ethers';
import { IPFSService, ProductData } from '../storage/IPFSService';

// We'll define the ABI interface here until we have the actual artifacts
interface DigitalPassportContract extends ethers.Contract {
  mintPassport(to: string, ipfsHash: string): Promise<ethers.ContractTransaction>;
  updateProductData(tokenId: ethers.BigNumberish, ipfsHash: string): Promise<ethers.ContractTransaction>;
  verifyProduct(tokenId: ethers.BigNumberish, verified: boolean): Promise<ethers.ContractTransaction>;
  getVerificationStatus(tokenId: ethers.BigNumberish): Promise<[boolean, number, string[]]>;
  getProductData(tokenId: ethers.BigNumberish): Promise<string>;
}

export class ProductAPI {
  private ipfsService: IPFSService;

  constructor(ipfsService: IPFSService) {
    this.ipfsService = ipfsService;
  }

  async createProduct(productData: ProductData): Promise<string> {
    try {
      const ipfsHash = await this.ipfsService.uploadProductData(productData);
      return ipfsHash;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(tokenId: ethers.BigNumberish, productData: ProductData): Promise<void> {
    try {
      await this.ipfsService.uploadProductData(productData);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async verifyProduct(tokenId: ethers.BigNumberish, verified: boolean): Promise<void> {
    try {
      // This will be implemented when we have the contract
      console.log('Product verification not implemented yet');
    } catch (error) {
      console.error('Error verifying product:', error);
      throw error;
    }
  }

  async getProductDetails(ipfsHash: string): Promise<ProductData | null> {
    try {
      const productData = await this.ipfsService.getProductData(ipfsHash);
      return productData;
    } catch (error) {
      console.error('Error getting product details:', error);
      return null;
    }
  }
} 