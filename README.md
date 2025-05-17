# VerimaOS: Decentralized Product Verification System

VerimaOS is an open-source platform that enables transparency in product sourcing, production, and verification. It allows stores to create digital passports for their products, which include key data points like carbon footprint, certifications, reviews, and more.

This project uses decentralized storage (IPFS/Filecoin) and smart contracts to ensure product integrity, transparency, and accountability.

## 🌟 Features

- **Digital Product Passports**: Create and manage verifiable digital identities for physical products
- **Decentralized Storage**: Utilize IPFS/Filecoin for secure, distributed data storage
- **Smart Contract Verification**: Ensure product authenticity through blockchain verification
- **Platform Integration**: Easy integration with e-commerce platforms like Shopify
- **Environmental Impact Tracking**: Monitor and verify product carbon footprint
- **Open Standards**: Contribute to the development of open verification standards

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Git
- IPFS (optional for local development)
- Ethereum development environment (e.g., Hardhat, Ganache)

### Installation

1. Clone the repository:
```bash
git clone git@github.com:VerimaOS/core.git
cd core
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
npm run dev
```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3000

# IPFS Configuration
IPFS_NODE_URL=http://localhost:5001

# Blockchain Configuration
CONTRACT_ADDRESS=your_contract_address
PROVIDER_URL=http://localhost:8545

# Optional: For production
PRIVATE_KEY=your_private_key
INFURA_PROJECT_ID=your_infura_project_id
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
```

## 📖 API Documentation

### Endpoints

#### Create Digital Passport
```http
POST /api/passport
```

Request body:
```json
{
  "name": "Product Name",
  "description": "Product Description",
  "manufacturer": "Manufacturer Name",
  "carbonFootprint": 10.5,
  "certifications": ["ISO9001", "GreenCert"],
  "manufacturingDate": "2023-05-17",
  "ownerAddress": "0x..."
}
```

#### Get Product Data
```http
GET /api/passport/:tokenId
```

#### Update Product Data
```http
PUT /api/passport/:tokenId
```

#### Verify Product
```http
GET /api/verify/:tokenId
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌐 Links

- [Website](https://verima.os)
- [Documentation](https://docs.verima.os)
- [Community Discord](https://discord.gg/verima)
- [Twitter](https://twitter.com/VerimaOS)

## ✨ Core Team

- [Core Team Member 1](https://github.com/username1)
- [Core Team Member 2](https://github.com/username2)

## 🙏 Acknowledgments

Special thanks to our contributors and partners who help make VerimaOS possible.
