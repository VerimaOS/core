import { IPFSService, ProductData } from '../src/storage/IPFSService';

describe('IPFSService', () => {
  let ipfsService: IPFSService;

  beforeEach(() => {
    ipfsService = new IPFSService('http://localhost:5001');
  });

  const sampleProductData: ProductData = {
    name: 'Test Product',
    description: 'A test product for unit testing',
    manufacturer: 'Test Manufacturer',
    carbonFootprint: 10.5,
    certifications: ['ISO9001', 'GreenCert'],
    manufacturingDate: '2023-05-17',
    additionalData: {
      batch: 'TEST123',
      location: 'Test Facility'
    }
  };

  describe('uploadProductData', () => {
    it('should upload product data and return a CID', async () => {
      const cid = await ipfsService.uploadProductData(sampleProductData);
      expect(cid).toBeDefined();
      expect(typeof cid).toBe('string');
      expect(cid.length).toBeGreaterThan(0);
    });
  });

  describe('getProductData', () => {
    it('should retrieve previously uploaded product data', async () => {
      const cid = await ipfsService.uploadProductData(sampleProductData);
      const retrievedData = await ipfsService.getProductData(cid);
      
      expect(retrievedData).toEqual(sampleProductData);
    });

    it('should throw error for invalid CID', async () => {
      await expect(ipfsService.getProductData('invalid-cid'))
        .rejects
        .toThrow('Failed to retrieve from IPFS');
    });
  });

  describe('updateProductData', () => {
    it('should update product data and return new CID', async () => {
      const updatedData = {
        ...sampleProductData,
        name: 'Updated Test Product'
      };

      const newCid = await ipfsService.updateProductData(updatedData);
      expect(newCid).toBeDefined();
      expect(typeof newCid).toBe('string');
      expect(newCid.length).toBeGreaterThan(0);

      const retrievedData = await ipfsService.getProductData(newCid);
      expect(retrievedData).toEqual(updatedData);
    });
  });
}); 