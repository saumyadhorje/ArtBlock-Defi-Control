export const contractABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "artist",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "gallery",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "tokenURI",
        "type": "string"
      }
    ],
    "name": "mint",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "buyArtwork",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  "event ArtworkMinted(uint256 indexed tokenId, address indexed artist, string ipfsHash, uint256 price)",
  "event ArtworkSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price)"
]; 