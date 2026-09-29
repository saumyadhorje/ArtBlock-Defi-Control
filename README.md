
# ArtBlock - Decentralized Art Curation & Investment Platform

![Alt text](https://i.imgur.com/uTKEjrp.jpeg)


## Overview  
This project is our entry for the VIT CSI CodeFlix hackathon for Track 2. The **Digital Art Gallery Platform** bridges the gap between digital artists and curators by enabling the creation and management of professional virtual galleries. With an intuitive interface, curators can manage digital spaces while artists can showcase their work and discover opportunities to reach a broader audience.  

```mermaid
flowchart TD
    %% User Entry Points
    subgraph UserEntry["User Entry Points"]
        Artist["Artist"]
        Gallery["Gallery Curator"]
        Investor["Art Collector"]
    end

    %% Authentication
    subgraph AuthFlow["Authentication Flow"]
        WebApp["Web Application"]
        MetaMask["MetaMask Wallet"]
        Auth["Authentication Layer"]
        Backend["Express Backend"]
        DB[(MongoDB)]
    end

    %% Artist Flow
    subgraph ArtistFlow["Artist Workflow"]
        IPFS["IPFS Storage"]
        Contract["Smart Contract"]
        Blockchain["Blockchain"]
    end

    %% Gallery Flow
    subgraph GalleryFlow["Gallery Workflow"]
        Collections["Gallery Collections"]
    end

    %% Marketplace
    subgraph MarketFlow["Marketplace Interactions"]
        Market["NFT Marketplace"]
    end

    %% Purchase Flow
    subgraph PurchaseFlow["NFT Purchase Flow"]
        Payments["Payment Distribution"]
        ArtistWallet["Artist Wallet (85%)"]
        GalleryWallet["Gallery Wallet (10%)"]
        Platform["Platform Wallet (5%)"]
    end

    %% Analytics & Dashboard
    subgraph Analytics["Analytics & Dashboard"]
        AnalyticsEngine["Analytics Engine"]
        ArtistDash["Artist Dashboard"]
        GalleryDash["Gallery Dashboard"]
        MarketStats["Market Statistics"]
    end

    %% Connections
    Artist & Gallery & Investor -->|Register/Login| WebApp
    WebApp -->|Web3 Auth| MetaMask
    MetaMask -->|Verify| Auth
    Auth -->|JWT| Backend
    Backend -->|Store User Data| DB

    Artist -->|Upload Art| IPFS
    IPFS -->|Get Hash| Contract
    Contract -->|Mint NFT| Blockchain

    Gallery -->|Curate| Collections
    Collections -->|Partner with| Artist
    Gallery -->|Set Commission| Contract

    Blockchain -->|List NFTs| Market
    Market -->|View| Investor
    Market -->|Curate| Gallery

    Investor -->|Buy NFT| Contract
    Contract -->|Split Payment| Payments
    Payments -->|85%| ArtistWallet
    Payments -->|10%| GalleryWallet
    Payments -->|5%| Platform

    Blockchain -->|Events| AnalyticsEngine
    DB -->|User Data| AnalyticsEngine
    AnalyticsEngine -->|Stats| ArtistDash & GalleryDash & MarketStats
    ArtistDash -->|View| Artist
    GalleryDash -->|View| Gallery
    MarketStats -->|View| Investor
```

## Core Features  

### **Gallery Management**  
- Complete control over virtual spaces with customizable themes.  
- Set commission rates and establish submission guidelines.  
- Robust tracking of gallery statistics, visitor engagement, and artist contributions.  
- Support for multiple gallery configurations for diverse themes or communities.  

### **Artist Features**  
- Comprehensive portfolio submission and application tracking.  
- Real-time updates on application status and communication with curators.  
- Tools to manage portfolios, set artwork prices, and control visibility.  
- Integration with social media for enhanced exposure.  

### **Gallery Navigation**  
- **Overview Tab**: Essential statistics, featured artists, and recent activities.  
- **Artworks Tab**: Grid and list viewing options with search and filtering capabilities.  
- **Artists Tab**: Detailed artist profiles, portfolio previews, and performance metrics.  
- **Applications Tab**: Streamlined review process with organized queue and communication tools.  
- **Settings Tab**: Comprehensive control over gallery configurations and permissions.  

---

## System Architecture & Flows  

### **User Authentication Flow**  
- Secure sign-up/login process with role-based access control for curators and artists.  

### **Gallery Creation & Management Flow**  
- End-to-end flow for creating and customizing galleries, managing artworks, and tracking metrics.  

### **Artist Application Process**  
- Professional application system with status tracking, communication tools, and detailed submissions.  

### **Data Relationship Model**  
- Users, Galleries, Applications, Artists, and Artworks schemas interlinked for seamless management.  

### **Gallery View Navigation**  
- Tab-based interface optimized for efficient gallery exploration and management.  

---

## Technical Architecture  

### **Frontend Architecture**  
- **Framework**: React.js with component-based architecture for modularity.  
- **Styling**: Tailwind CSS for consistency, Framer Motion for smooth animations.  
- **Responsiveness**: Optimized for devices of all sizes.  

### **Database Architecture**  
- **Schemas**:  
  - **Users**: Manages authentication and roles.  
  - **Galleries**: Tracks gallery configurations and associations.  
  - **Applications**: Records artist submissions and review statuses.  
  - **Artists**: Manages profiles and portfolios.  
  - **Artworks**: Stores individual artwork details and gallery associations.  

---

## Security Features  
- **Role-based Access Control**: Ensures users have permissions aligned with their roles.  
- **Secure Authentication**: Strong protocols to protect user credentials.  
- **Data Validation**: Ensures integrity of submitted content and user data.  
- **Content Moderation Tools**: Maintains gallery integrity and user trust.  
- **Privacy Controls**: Safeguards user data and communication channels.  

---

## Future Enhancements  
- **NFT Integration**: Support for tokenized artworks.  
- **Virtual Gallery Tours**: Immersive VR-based gallery experiences.  
- **Advanced Analytics**: Enhanced insights into performance and engagement.  
- **Real-Time Notifications**: Instant updates on gallery activities.  
- **Integrated Chat System**: Seamless communication between users.  
- **Mobile App and PWA Support**: Broadened accessibility and convenience.  

---

## Project Status  
The project is currently in **active development**, with a focus on core feature implementation and optimization. It is designed for scalability, maintainability, and an exceptional user experience.  

---

## Contributing  
This project is **closed for external contributions**. For inquiries or potential collaboration, please contact the development team.  

---

## License  
All rights reserved. This project is **proprietary and confidential**.  

---

## Notes  
This documentation will evolve as the project progresses. Stay tuned for updates.  

