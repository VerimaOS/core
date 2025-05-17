import { create } from 'ipfs-http-client'
import type { IPFSHTTPClient } from 'ipfs-http-client'
import { Buffer } from 'buffer';
import { gzip, ungzip } from 'node-gzip';
import NodeCache from 'node-cache';

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
  private cache: NodeCache;
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(ipfsNodeUrl: string = 'http://localhost:5001') {
    this.client = create({ url: ipfsNodeUrl });
    this.cache = new NodeCache({
      stdTTL: this.CACHE_TTL,
      checkperiod: 600, // Check for expired keys every 10 minutes
      useClones: false
    });

    // Handle cache errors
    this.cache.on('error', (err) => {
      console.error('Cache error:', err);
    });
  }

  /**
   * Compresses data using gzip
   * @param data Data to compress
   * @returns Compressed data buffer
   */
  private async compressData(data: string): Promise<Buffer> {
    try {
      return await gzip(data);
    } catch (error) {
      throw new Error(`Failed to compress data: ${error}`);
    }
  }

  /**
   * Decompresses gzipped data
   * @param data Compressed data buffer
   * @returns Decompressed data string
   */
  private async decompressData(data: Buffer): Promise<string> {
    try {
      return (await ungzip(data)).toString();
    } catch (error) {
      throw new Error(`Failed to decompress data: ${error}`);
    }
  }

  /**
   * Uploads product data to IPFS with compression
   * @param data Product data to store
   * @returns IPFS content identifier (CID)
   */
  async uploadProductData(data: ProductData): Promise<string> {
    try {
      const jsonData = JSON.stringify(data);
      const compressedData = await this.compressData(jsonData);
      const result = await this.client.add(compressedData);
      
      // Cache the data with the CID as key
      this.cache.set(result.path, data);
      
      return result.path;
    } catch (error) {
      throw new Error(`Failed to upload to IPFS: ${error}`);
    }
  }

  /**
   * Retrieves product data from cache or IPFS
   * @param cid IPFS content identifier
   * @returns Product data
   */
  async getProductData(cid: string): Promise<ProductData> {
    try {
      // Try to get data from cache first
      const cachedData = this.cache.get<ProductData>(cid);
      if (cachedData) {
        return cachedData;
      }

      // If not in cache, get from IPFS
      const stream = this.client.cat(cid);
      const chunks: Uint8Array[] = [];
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const compressedData = Buffer.concat(chunks);
      const decompressedData = await this.decompressData(compressedData);
      const productData: ProductData = JSON.parse(decompressedData);

      // Cache the retrieved data
      this.cache.set(cid, productData);

      return productData;
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
    const cid = await this.uploadProductData(data);
    return cid;
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

  /**
   * Clears the cache for a specific CID
   * @param cid IPFS content identifier
   */
  clearCache(cid: string): void {
    this.cache.del(cid);
  }

  /**
   * Gets cache statistics
   * @returns Cache statistics
   */
  getCacheStats(): {
    hits: number;
    misses: number;
    keys: number;
    ksize: number;
    vsize: number;
  } {
    return this.cache.getStats();
  }
} 