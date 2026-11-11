export const contractABI = [
  // Core ArtBlock functions
  "function mint(address artist, address gallery, string title, string description, string ipfsHash, uint256 price, string uri) public returns (uint256)",
  "function buyArtwork(uint256 tokenId) public payable",
  "function owner() public view returns (address)",
  "function galleryFactory() public view returns (address)",
  "function artworks(uint256 tokenId) public view returns (string title, string description, string ipfsHash, uint256 price, address creator, uint256 createdAt, bool isListed)",
  "function paymentSplits(uint256 tokenId) public view returns (address artist, address gallery, address platform, uint256 artistShare, uint256 galleryShare, uint256 platformShare)",

  // Standard ERC-721 functions & overrides
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function approve(address to, uint256 tokenId) public",
  "function getApproved(uint256 tokenId) public view returns (address)",
  "function setApprovalForAll(address operator, bool approved) public",
  "function isApprovedForAll(address owner, address operator) public view returns (bool)",
  "function transferFrom(address from, address to, uint256 tokenId) public",
  "function safeTransferFrom(address from, address to, uint256 tokenId) public",
  "function safeTransferFrom(address from, address to, uint256 tokenId, bytes data) public",

  // Events
  "event ArtworkMinted(uint256 indexed tokenId, address indexed artist, string ipfsHash, uint256 price)",
  "event ArtworkSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price)",
  "event PaymentDistributed(address indexed recipient, uint256 amount, uint256 share)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

export default contractABI;