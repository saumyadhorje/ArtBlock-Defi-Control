// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./GalleryFactory.sol";

contract ArtBlockNFT is ERC721, ERC721URIStorage {

    uint256 private _nextTokenId;
    address private _owner;
    GalleryFactory public galleryFactory;

    
    struct PaymentSplit {
        address artist;
        address gallery;
        address platform;
        uint256 artistShare; // 85%
        uint256 galleryShare; // 10%
        uint256 platformShare; // 5%
    }

    
    mapping(uint256 => PaymentSplit) public paymentSplits;
    
    
    struct ArtworkMetadata {
        string title;
        string description;
        string ipfsHash;
        uint256 price;
        address creator;
        uint256 createdAt;
        bool isListed;
    }

    
    mapping(uint256 => ArtworkMetadata) public artworks;

    
    event ArtworkMinted(
        uint256 indexed tokenId,
        address indexed artist,
        string ipfsHash,
        uint256 price
    );
    
    event ArtworkSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );

    event PaymentDistributed(
        address indexed recipient,
        uint256 amount,
        uint256 share
    );

    constructor(address initialOwner) 
        ERC721("ArtBlock", "ARTB") 
    {
        _owner = initialOwner;
    }

    function setGalleryFactory(address _galleryFactoryAddress) external {
        require(msg.sender == _owner, "Not the owner");
        require(address(galleryFactory) == address(0), "GalleryFactory already set");
        galleryFactory = GalleryFactory(_galleryFactoryAddress);
    }

    modifier onlyOwner() {
        require(msg.sender == _owner, "Not the owner");
        _;
    }

    function owner() public view returns (address) {
        return _owner;
    }

    function mint(
        address artist,
        address gallery,
        string memory title,
        string memory description,
        string memory ipfsHash,
        uint256 price,
        string memory uri  
    ) public returns (uint256) {
        require(msg.sender == artist, "Only artist can mint");
        require(galleryFactory.validateGallery(gallery), "Invalid gallery");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(artist, tokenId);
        _setTokenURI(tokenId, uri);

        
        paymentSplits[tokenId] = PaymentSplit({
            artist: artist,
            gallery: gallery,
            platform: owner(),
            artistShare: 85,
            galleryShare: 10,
            platformShare: 5
        });

        
        artworks[tokenId] = ArtworkMetadata({
            title: title,
            description: description,
            ipfsHash: ipfsHash,
            price: price,
            creator: artist,
            createdAt: block.timestamp,
            isListed: true
        });

        emit ArtworkMinted(tokenId, artist, ipfsHash, price);
        return tokenId;
    }

    function buyArtwork(uint256 tokenId) public payable {
        ArtworkMetadata storage artwork = artworks[tokenId];
        require(artwork.isListed, "Artwork not listed for sale");
        require(msg.value >= artwork.price, "Insufficient payment");

        address seller = ownerOf(tokenId);
        PaymentSplit storage split = paymentSplits[tokenId];
        
        require(galleryFactory.validateGallery(split.gallery), "Invalid gallery");

        uint256 artistPayment = (msg.value * split.artistShare) / 100;
        uint256 galleryPayment = (msg.value * split.galleryShare) / 100;
        uint256 platformPayment = (msg.value * split.platformShare) / 100;

        payable(split.artist).transfer(artistPayment);
        emit PaymentDistributed(split.artist, artistPayment, split.artistShare);

        (bool gallerySuccess,) = split.gallery.call{value: galleryPayment}("");
        require(gallerySuccess, "Gallery payment failed");
        emit PaymentDistributed(split.gallery, galleryPayment, split.galleryShare);

        payable(split.platform).transfer(platformPayment);
        emit PaymentDistributed(split.platform, platformPayment, split.platformShare);

        _transfer(seller, msg.sender, tokenId);
        artwork.isListed = false;

        emit ArtworkSold(tokenId, seller, msg.sender, msg.value);
    }

   
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage)
        returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage)
        returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}