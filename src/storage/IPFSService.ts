import { create, IPFSHTTPClient } from 'ipfs-http-client';

export interface ProductData {
  name: string;
  description: string;
  manufacturer: string;
  carbonFootprint: number;
  certifications: string[];
  manufacturingDate: string;
  additionalData?: Record<string, unknown>;
}

export class IPFSService {
  private client: IPFSHTTPClient;

  constructor(ipfsNodeUrl: string = 'http://localhost:5001') {
    this.client = create({ url: ipfsNodeUrl });
  }

  /**
   * Uploads product data to IPFS
   * @param data Product data to store
   * @returns IPFS content identifier (CID)
   */
  async uploadProductData(data: ProductData): Promise<string> {
    try {
      const jsonData = JSON.stringify(data);
      const result = await this.client.add(jsonData);
      return result.path;
    } catch (error) {
      throw new Error(`Failed to upload to IPFS: ${error}`);
    }
  }

  /**
   * Retrieves product data from IPFS
   * @param cid IPFS content identifier
   * @returns Product data
   */
  async getProductData(cid: string): Promise<ProductData> {
    try {
      const stream = this.client.cat(cid);
      const chunks = [];
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const data = Buffer.concat(chunks).toString();
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Failed to retrieve from IPFS: ${error}`);
    }
  }

  /**
   * Updates existing product data on IPFS
   * @param data Updated product data
   * @returns New IPFS content identifier (CID)
   */
  async updateProductData(data: ProductData): Promise<string> {
    return this.uploadProductData(data);
  }

  /**
   * Pins content to ensure persistence
   * @param cid IPFS content identifier to pin
   */
  async pinContent(cid: string): Promise<void> {
    try {
      await this.client.pin.add(cid);
    } catch (error) {
      throw new Error(`Failed to pin content: ${error}`);
    }
  }
} 