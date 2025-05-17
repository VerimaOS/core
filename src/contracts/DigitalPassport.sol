// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DigitalPassport is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Reward token contract
    IERC20 public rewardToken;
    
    // Verification and rewards configuration
    uint256 public constant VERIFICATION_REWARD = 10 * 10**18; // 10 tokens
    uint256 public constant MINIMUM_VERIFICATIONS = 3;
    uint256 public constant VERIFICATION_TIMEOUT = 7 days;

    // Structs
    struct ProductData {
        string ipfsHash;
        uint256 lastVerificationTime;
        uint256 verificationCount;
        bool isVerified;
        address[] verifiers;
        mapping(address => bool) hasVerified;
    }

    struct TransferHistory {
        address from;
        address to;
        uint256 timestamp;
    }

    // Mappings
    mapping(uint256 => ProductData) private _productData;
    mapping(uint256 => TransferHistory[]) private _transferHistory;
    mapping(address => uint256) public verifierReputation;

    // Events
    event PassportMinted(uint256 indexed tokenId, address indexed owner, string ipfsHash);
    event ProductDataUpdated(uint256 indexed tokenId, string ipfsHash);
    event ProductVerified(uint256 indexed tokenId, address indexed verifier, bool verified);
    event RewardDistributed(address indexed verifier, uint256 amount);
    event TransferRecorded(uint256 indexed tokenId, address indexed from, address indexed to);

    constructor(address _rewardToken) ERC721("VerimaOS Digital Passport", "VDP") {
        rewardToken = IERC20(_rewardToken);
    }

    /**
     * @dev Mints a new digital passport
     * @param to The address that will own the passport
     * @param ipfsHash The IPFS hash containing the product data
     * @return The ID of the newly minted passport
     */
    function mintPassport(address to, string memory ipfsHash) public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(to, newTokenId);
        _setTokenURI(newTokenId, ipfsHash);
        
        ProductData storage newProduct = _productData[newTokenId];
        newProduct.ipfsHash = ipfsHash;
        newProduct.lastVerificationTime = block.timestamp;
        newProduct.verificationCount = 0;
        newProduct.isVerified = false;

        emit PassportMinted(newTokenId, to, ipfsHash);
        return newTokenId;
    }

    /**
     * @dev Updates the product data for an existing passport
     * @param tokenId The ID of the passport to update
     * @param newIpfsHash The new IPFS hash containing updated product data
     */
    function updateProductData(uint256 tokenId, string memory newIpfsHash) public {
        require(_exists(tokenId), "Passport does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the passport owner");

        ProductData storage product = _productData[tokenId];
        product.ipfsHash = newIpfsHash;
        product.lastVerificationTime = block.timestamp;
        product.verificationCount = 0;
        product.isVerified = false;

        _setTokenURI(tokenId, newIpfsHash);
        emit ProductDataUpdated(tokenId, newIpfsHash);
    }

    /**
     * @dev Verifies a product's authenticity
     * @param tokenId The ID of the passport to verify
     * @param verified Whether the product is verified as authentic
     */
    function verifyProduct(uint256 tokenId, bool verified) public {
        require(_exists(tokenId), "Passport does not exist");
        require(!_productData[tokenId].hasVerified[msg.sender], "Already verified by this address");
        require(msg.sender != ownerOf(tokenId), "Owner cannot verify their own product");

        ProductData storage product = _productData[tokenId];
        product.hasVerified[msg.sender] = true;
        product.verifiers.push(msg.sender);
        product.verificationCount++;

        if (product.verificationCount >= MINIMUM_VERIFICATIONS) {
            product.isVerified = verified;
            _distributeRewards(product.verifiers);
        }

        emit ProductVerified(tokenId, msg.sender, verified);
    }

    /**
     * @dev Distributes rewards to verifiers
     * @param verifiers Array of verifier addresses
     */
    function _distributeRewards(address[] memory verifiers) private {
        uint256 rewardPerVerifier = VERIFICATION_REWARD / verifiers.length;
        
        for (uint256 i = 0; i < verifiers.length; i++) {
            address verifier = verifiers[i];
            verifierReputation[verifier]++;
            require(rewardToken.transfer(verifier, rewardPerVerifier), "Reward transfer failed");
            emit RewardDistributed(verifier, rewardPerVerifier);
        }
    }

    /**
     * @dev Override of the transfer function to record transfer history
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        if (from != address(0)) { // Skip for minting
            _transferHistory[tokenId].push(TransferHistory({
                from: from,
                to: to,
                timestamp: block.timestamp
            }));
            emit TransferRecorded(tokenId, from, to);
        }
    }

    /**
     * @dev Gets the transfer history for a token
     * @param tokenId The ID of the passport
     */
    function getTransferHistory(uint256 tokenId) public view returns (TransferHistory[] memory) {
        require(_exists(tokenId), "Passport does not exist");
        return _transferHistory[tokenId];
    }

    /**
     * @dev Gets the verification status of a product
     * @param tokenId The ID of the passport
     */
    function getVerificationStatus(uint256 tokenId) public view returns (
        bool isVerified,
        uint256 verificationCount,
        address[] memory verifiers
    ) {
        require(_exists(tokenId), "Passport does not exist");
        ProductData storage product = _productData[tokenId];
        return (
            product.isVerified,
            product.verificationCount,
            product.verifiers
        );
    }

    /**
     * @dev Retrieves the product data IPFS hash for a passport
     * @param tokenId The ID of the passport
     */
    function getProductData(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Passport does not exist");
        return _productData[tokenId].ipfsHash;
    }
} 