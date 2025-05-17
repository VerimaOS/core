// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DigitalPassport is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Mapping from token ID to IPFS hash of product data
    mapping(uint256 => string) private _productData;

    // Events
    event PassportMinted(uint256 indexed tokenId, address indexed owner, string ipfsHash);
    event ProductDataUpdated(uint256 indexed tokenId, string ipfsHash);

    constructor() ERC721("VerimaOS Digital Passport", "VDP") {}

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
        _productData[newTokenId] = ipfsHash;

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

        _productData[tokenId] = newIpfsHash;
        _setTokenURI(tokenId, newIpfsHash);

        emit ProductDataUpdated(tokenId, newIpfsHash);
    }

    /**
     * @dev Retrieves the product data IPFS hash for a passport
     * @param tokenId The ID of the passport
     * @return The IPFS hash containing the product data
     */
    function getProductData(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Passport does not exist");
        return _productData[tokenId];
    }
} 