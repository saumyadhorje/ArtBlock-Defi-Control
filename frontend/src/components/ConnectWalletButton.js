import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getUser, clearUserSession } from '../utils/auth';

const ConnectWalletButton = () => {
  const navigate = useNavigate();
  const user = getUser();
  const isLoggedIn = isAuthenticated();

  const handleClick = () => {
    if (isLoggedIn) {
      if (window.confirm('Do you want to disconnect?')) {
        clearUserSession();
        window.location.reload();
      }
    } else {
      navigate('/auth');
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="px-6 py-3 bg-[#FFE951] text-base font-bold border-3 
        border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] 
        hover:shadow-none transition-all flex items-center gap-2"
    >
      {isLoggedIn ? (
        <>
          <span className="h-2 w-2 rounded-full bg-green-500" />
          {formatAddress(user?.walletAddress)}
        </>
      ) : (
        'Login / Register'
      )}
    </motion.button>
  );
};

export default ConnectWalletButton;