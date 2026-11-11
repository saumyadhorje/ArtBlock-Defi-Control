# ArtBlock – Decentralized NFT Art Marketplace

ArtBlock is a blockchain-powered digital art marketplace that connects artists and buyers through NFTs. It enables artists to generate and showcase digital artwork, mint their creations as NFTs, and list them for sale. Buyers can explore the marketplace, purchase digital artwork securely using MetaMask, and view their purchased NFTs.

The platform combines **AI-powered art generation, NFT technology, smart contracts, and decentralized storage** to create a transparent digital art ecosystem.

## Key Features

### 🎨 Artist Dashboard
- Generate digital artwork using AI.
- Upload and manage digital artwork.
- Mint artwork as NFTs on the blockchain.
- Set artwork prices and list NFTs for sale.
- Manage created artwork and listing status.
- Create and manage galleries.

### 🛒 Buyer Dashboard
- Explore available NFT artworks.
- View artwork details and prices.
- Connect a MetaMask wallet.
- Purchase listed NFTs using cryptocurrency.
- View purchased artwork in the purchases section.
- Track ownership of purchased NFTs.

### 🤖 AI-Powered Art Generation
- Generate artwork using AI-based image generation.
- Create unique digital artwork from text prompts.
- Integrate generated artwork into the NFT minting workflow.

### ⛓️ Blockchain Integration
- Solidity-based smart contracts for NFT creation and transactions.
- NFT minting and ownership tracking.
- Smart contract-based artwork purchases.
- MetaMask wallet integration.
- Local blockchain development using Anvil.

### 💰 Automated Payment Distribution
When an artwork is purchased, the smart contract distributes the payment automatically:

| Recipient | Share |
|---|---:|
| Artist | 85% |
| Gallery | 10% |
| Platform | 5% |

### 🖼️ Gallery Management
- Create and manage digital art galleries.
- Associate artwork with galleries.
- Support gallery-based artwork organization.

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React.js, JavaScript, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Blockchain | Solidity, Ethereum-compatible blockchain |
| Smart Contracts | Hardhat |
| Local Blockchain | Anvil |
| Wallet Integration | MetaMask |
| Blockchain Interaction | Ethers.js |
| AI Image Generation | Hugging Face / FLUX |
| Decentralized Storage | IPFS integration |

## System Architecture

ArtBlock follows a full-stack architecture connecting the frontend, backend, database, AI image generation service, and blockchain.

```text
             ARTIST / BUYER
                    |
                    v
             REACT FRONTEND
                    |
          +---------+---------+
          |                   |
          v                   v
     EXPRESS BACKEND      METAMASK
          |                   |
          v                   v
       MONGODB          BLOCKCHAIN
          |                   |
          v                   v
    AI IMAGE SERVICE    SMART CONTRACTS
          |                   |
          v                   v
     IPFS STORAGE       NFT OWNERSHIP
                              |
                              v
                       PAYMENT SPLIT
```

## Smart Contract Functionality

The smart contracts support the core NFT marketplace operations:

- Minting new artwork as NFTs.
- Storing artwork metadata.
- Managing NFT listing status.
- Purchasing listed artwork.
- Transferring NFT ownership.
- Distributing payments between the artist, gallery, and platform.

## Application Workflow

### Artist Workflow
1. Register or log in as an artist.
2. Connect a MetaMask wallet.
3. Generate or upload digital artwork.
4. Mint the artwork as an NFT.
5. Set its price and list it on the marketplace.
6. Manage created artworks through the artist dashboard.

### Buyer Workflow
1. Register or log in as a buyer.
2. Connect a MetaMask wallet.
3. Browse available NFTs.
4. Select an artwork and initiate a purchase.
5. Confirm the blockchain transaction through MetaMask.
6. View purchased artwork in the purchases section.

## Running the Project Locally

### Prerequisites
- Node.js and npm
- MongoDB
- MetaMask browser extension
- Foundry (Anvil)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/saumyadhorje/ArtBlock-Defi-Control.git
cd ArtBlock-Defi-Control
```

### 2. Install Dependencies

Install the project dependencies in the root, backend, and frontend directories as applicable.

```bash
npm install
```

```bash
cd backend
npm install
```

```bash
cd ../frontend
npm install
```

### 3. Configure Environment Variables

Create the required `.env` files for the backend, frontend, and AI services.

Configure the necessary values for:
- MongoDB connection
- Authentication and JWT
- AI image generation API
- Blockchain and contract configuration
- IPFS integration

Do not commit API keys, passwords, or private keys to GitHub.

### 4. Start the Local Blockchain

From the project root, run:

```powershell
anvil --port 8546 --state .\anvil.state.json --state-interval 30
```

### 5. Start the Backend

```bash
cd backend
npm start
```

The backend runs on port `5000` in the local development setup.

### 6. Start the Frontend

Open another terminal:

```bash
cd frontend
npm start
```

Open the local frontend URL displayed in the terminal.

### 7. Connect MetaMask

- Add the local Anvil network to MetaMask.
- Network name: Anvil Local
- RPC URL: `http://127.0.0.1:8546`
- Chain ID: `31337`
- Currency symbol: `ETH`

For local testing, import an Anvil development account into MetaMask. Never use Anvil test accounts or private keys on a real network.

## Project Structure

```text
ArtBlock-Defi-Control/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── server.js
│
├── contracts/
│   ├── ArtBlockNFT.sol
│   └── ArtCuration.sol
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       └── utils/
│
├── scripts/
├── test/
├── hardhat.anvil.config.cjs
└── README.md
```

## Security Considerations

- Role-based access for artist and buyer functionality.
- Wallet-based blockchain transaction confirmation.
- Smart contract validation for NFT purchases.
- Backend validation of purchase synchronization.
- Environment variables for sensitive configuration.
- Blockchain transaction records for transparent ownership tracking.

## Future Enhancements

- Deployment to a public blockchain testnet or mainnet.
- Enhanced NFT discovery and recommendation features.
- Advanced artwork analytics.
- Improved decentralized storage integration.
- Expanded marketplace functionality.

## Project Status

**Active Development**

ArtBlock is being developed as a decentralized NFT art marketplace with AI-powered artwork generation, blockchain-based NFT minting, wallet integration, and smart contract-driven purchases.

## License

All rights reserved. This project is proprietary and confidential.
