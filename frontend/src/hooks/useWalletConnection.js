import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ensureHardhatNetwork } from '../utils/network';
const clearArtBlockSession = () => {
  [
    'artblock_token',
    'artblock_user',
    'artblock_wallet'
  ].forEach((key) => localStorage.removeItem(key));
};
const useWalletConnection = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      return;
    }

    ensureHardhatNetwork().catch((err) => {
      console.warn('Network warning:', err.message);
    });

    // Handle account changes
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        //localStorage.clear();
        clearArtBlockSession();
        navigate('/auth');
      } else {
        const storedUserStr = localStorage.getItem('artblock_user');
        if (storedUserStr) {
          try {
            const user = JSON.parse(storedUserStr);
            if (user.walletAddress && user.walletAddress.toLowerCase() !== accounts[0].toLowerCase()) {
              console.log(`Active MetaMask account switched from ${user.walletAddress} to ${accounts[0]}`);
              //localStorage.clear();
              clearArtBlockSession();
              navigate('/auth');
            }
          } catch (e) {
            console.error('Error handling account switch:', e);
          }
        }
      }
    };

    // Handle chain changes
    const handleChainChanged = () => {
      window.location.reload();
    };

    // Handle disconnect
    const handleDisconnect = () => {
     // localStorage.clear();
     clearArtBlockSession();
      navigate('/auth');
    };

    // Add listeners
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    // Cleanup listeners
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('disconnect', handleDisconnect);
    };
  }, [navigate]);
};

export default useWalletConnection;