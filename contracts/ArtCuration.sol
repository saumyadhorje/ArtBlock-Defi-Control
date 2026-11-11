// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ArtCuration
 * @dev ERC721 contract with Artist and Curator roles.
 * Artists can mint NFTs representing artworks. Curators can purchase them.
 */
contract ArtCuration is ERC721URIStorage, AccessControl {
    bytes32 public constant ARTIST_ROLE = keccak256("ARTIST_ROLE");
    bytes32 public constant CURATOR_ROLE = keccak256("CURATOR_ROLE");

    uint256 private _tokenIdCounter;

    // Price mapping for each token (in wei).
    mapping(uint256 => uint256) public tokenPrice;

    // Track whether a token has been sold.
    mapping(uint256 => bool) public isSold;

    event ArtCreated(
        uint256 indexed tokenId,
        address indexed artist,
        uint256 price
    );

    event ArtPurchased(
        uint256 indexed tokenId,
        address indexed curator,
        uint256 price
    );

    constructor() ERC721("ArtCuration", "ARTC") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Grant artist role to an address. Only admin can call.
     */
    function grantArtist(
        address artist
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(ARTIST_ROLE, artist);
    }

    /**
     * @dev Grant curator role to an address. Only admin can call.
     */
    function grantCurator(
        address curator
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(CURATOR_ROLE, curator);
    }

    /**
     * @dev Artist mints an artwork NFT with metadata URI and price.
     * @param tokenURI IPFS URI pointing to metadata JSON.
     * @param price Price in wei that the curator must pay.
     */
    function createArt(
        string memory tokenURI,
        uint256 price
    ) external onlyRole(ARTIST_ROLE) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter += 1;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        tokenPrice[tokenId] = price;
        isSold[tokenId] = false;

        emit ArtCreated(tokenId, msg.sender, price);
    }

    /**
     * @dev Curator purchases an unsold artwork.
     * @param tokenId ID of the token to purchase.
     */
    function purchaseArt(
        uint256 tokenId
    ) external payable onlyRole(CURATOR_ROLE) {
        require(
            _ownerOf(tokenId) != address(0),
            "Token does not exist"
        );

        require(!isSold[tokenId], "Already sold");

        uint256 price = tokenPrice[tokenId];

        require(price > 0, "Invalid art price");
        require(msg.value >= price, "Insufficient payment");

        address artist = ownerOf(tokenId);

        isSold[tokenId] = true;

        _transfer(artist, msg.sender, tokenId);

        // Transfer payment to the original artist.
        (bool success, ) = payable(artist).call{value: price}("");
        require(success, "Artist payment failed");

        // Refund excess payment.
        if (msg.value > price) {
            (bool refundSuccess, ) = payable(msg.sender).call{
                value: msg.value - price
            }("");

            require(refundSuccess, "Refund failed");
        }

        emit ArtPurchased(tokenId, msg.sender, price);
    }

    /**
     * @dev Resolve supportsInterface inheritance from ERC721URIStorage
     * and AccessControl.
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}