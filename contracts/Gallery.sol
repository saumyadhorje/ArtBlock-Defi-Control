// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ArtBlockNFT.sol";

contract Gallery is Ownable {
    // State variables
    string public name;
    string public description;
    address public curator;
    address public artBlockContract;
    uint256 public totalRevenue;
    uint256 public pendingRevenue;
    bool public isActive;

    // Events
    event GalleryCreated(address indexed curator, string name);
    event RevenueReceived(uint256 amount, uint256 timestamp);
    event RevenueClaimed(uint256 amount, uint256 timestamp);
    event GalleryStatusChanged(bool isActive);

    // Modifiers
    modifier onlyArtBlock() {
        require(msg.sender == artBlockContract, "Only ArtBlock contract can call this");
        _;
    }

    modifier onlyCurator() {
        require(msg.sender == curator, "Only curator can call this");
        _;
    }

    constructor(
        string memory _name,
        string memory _description,
        address _curator,
        address _artBlockContract
    ) Ownable(msg.sender) {
        name = _name;
        description = _description;
        curator = _curator;
        artBlockContract = _artBlockContract;
        isActive = true;

        emit GalleryCreated(curator, name);
    }

    // Function to receive revenue from art sales (10% share)
    receive() external payable {
        pendingRevenue += msg.value;
        totalRevenue += msg.value;
        emit RevenueReceived(msg.value, block.timestamp);
    }

    // Function for curator to claim their revenue
    function claimRevenue() external onlyCurator {
        require(pendingRevenue > 0, "No revenue to claim");
        uint256 amount = pendingRevenue;
        pendingRevenue = 0;
        
        (bool success, ) = payable(curator).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit RevenueClaimed(amount, block.timestamp);
    }

    // Function to toggle gallery active status
    function setGalleryStatus(bool _isActive) external onlyCurator {
        isActive = _isActive;
        emit GalleryStatusChanged(_isActive);
    }

    // Function to get gallery details
    function getGalleryDetails() external view returns (
        string memory _name,
        string memory _description,
        address _curator,
        uint256 _totalRevenue,
        uint256 _pendingRevenue,
        bool _isActive
    ) {
        return (
            name,
            description,
            curator,
            totalRevenue,
            pendingRevenue,
            isActive
        );
    }
} 