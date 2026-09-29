import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useWalletConnection = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      return;
    }

    // Handle account changes
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // Clear local storage
        localStorage.clear();
        // Redirect to auth page
        navigate('/auth');
      }
    };

    // Handle chain changes
    const handleChainChanged = () => {
      // Reload the page on chain change
      window.location.reload();
    };

    // Handle disconnect
    const handleDisconnect = () => {
      localStorage.clear();
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