// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Gallery.sol";
import "./ArtBlockNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GalleryFactory is Ownable {
    ArtBlockNFT public artBlockContract;
    
    // Mapping of curator addresses to their galleries
    mapping(address => address[]) public curatorGalleries;
    // Mapping to track if an address is a valid gallery
    mapping(address => bool) public isValidGallery;

    event GalleryCreated(
        address indexed galleryAddress,
        address indexed curator,
        string name
    );

    constructor(address initialOwner) Ownable(initialOwner) {
        // artBlockContract will be set later
    }

    function setArtBlockContract(address _artBlockAddress) external onlyOwner {
        require(address(artBlockContract) == address(0), "ArtBlock already set");
        artBlockContract = ArtBlockNFT(_artBlockAddress);
    }

    function createGallery(
        string memory _name,
        string memory _description
    ) external returns (address) {
        Gallery newGallery = new Gallery(
            _name,
            _description,
            msg.sender,
            address(artBlockContract)
        );

        address galleryAddress = address(newGallery);
        curatorGalleries[msg.sender].push(galleryAddress);
        isValidGallery[galleryAddress] = true;

        emit GalleryCreated(
            galleryAddress,
            msg.sender,
            _name
        );

        return galleryAddress;
    }

    function getCuratorGalleries(address curator) 
        external 
        view 
        returns (address[] memory) 
    {
        return curatorGalleries[curator];
    }

    function validateGallery(address galleryAddress) 
        external 
        view 
        returns (bool) 
    {
        return isValidGallery[galleryAddress];
    }
} 