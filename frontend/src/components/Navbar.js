import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { clearUserSession } from '../utils/auth';
import { 
  Layout, 
  Palette, 
  Building2, 
  Users,
  Wallet as WalletIcon,
  ChevronDown,
  LogOut,
  Image as ImageIcon
} from 'lucide-react';

const NavButton = ({ children, icon: Icon, onClick, active = false }) => (
  <motion.button
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`
      group px-4 py-2 text-sm font-medium rounded-xl
      flex items-center gap-2 transition-all duration-200 relative
      ${active 
        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
        : 'hover:bg-white/[0.02] text-white/70 hover:text-white'
      }
    `}
  >
    {Icon && (
      <motion.div
        whileHover={{ rotate: 5 }}
        className="transition-transform duration-200"
      >
        <Icon className="w-4 h-4" />
      </motion.div>
    )}
    <span className="font-['Plus_Jakarta_Sans']">{children}</span>
    
    {/* Animated underline effect */}
    {!active && (
      <motion.div
        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500"
        initial={{ width: 0 }}
        whileHover={{ width: '100%' }}
        transition={{ duration: 0.2 }}
      />
    )}
  </motion.button>
);

const WalletButton = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('artblock_user'));
  const token = localStorage.getItem('artblock_token');

  if (!user || !token) {
    navigate('/auth');
    return null;
  }

  const handleDisconnect = () => {
    clearUserSession();
    navigate('/auth');
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 rounded-xl bg-gradient-to-r from-white/[0.03] to-white/[0.05]
          border border-white/10 hover:border-indigo-500/40 transition-all duration-200
          flex items-center gap-2 text-white/90 hover:text-white backdrop-blur-sm"
      >
        <motion.div
          whileHover={{ rotate: 5 }}
          className="transition-transform duration-200"
        >
          <WalletIcon className="w-4 h-4" />
        </motion.div>
        <span className="font-['Plus_Jakarta_Sans'] text-sm">
          {`${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 rounded-xl bg-[#1A1A1A] border border-white/10
              shadow-lg shadow-black/20 backdrop-blur-xl overflow-hidden"
          >
            <motion.button
              whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              onClick={handleDisconnect}
              className="w-full px-4 py-3 flex items-center gap-2 text-sm text-white/70
                hover:text-white transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-['Plus_Jakarta_Sans']">Disconnect Wallet</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('artblock_user'));
  const token = localStorage.getItem('artblock_token');

  const Logo = () => (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="flex items-center gap-3 cursor-pointer group"
      onClick={() => navigate('/')}
    >
      <motion.span 
        className="text-2xl font-bold text-white font-['Space_Grotesk'] hidden sm:block
          bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 
          group-hover:to-indigo-400 transition-all duration-200"
        whileHover={{ y: -2 }}
      >
        Art <span className='bg-gradient-to-r from-blue-500 to-indigo-500 text-transparent bg-clip-text'>Block</span>
      </motion.span>
    </motion.div>
  );

  if (!user || !token) {
    return (
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-gradient-to-b from-[#0A0A0A]/95 to-[#0A0A0A]/80 
          backdrop-blur-xl border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Logo />
          </div>
        </div>
      </motion.nav>
    );
  }

  const handleDashboardClick = () => {
    const role = user.role?.toLowerCase();
    if (role) {
      navigate(`/dashboard/${role}`);
    }
  };

  const navItems = [
    { 
      name: 'Dashboard', 
      icon: Layout,
      onClick: handleDashboardClick,
      active: window.location.pathname.includes('/dashboard')
    },
    { 
      name: 'Galleries', 
      icon: Building2,
      onClick: () => navigate('/galleries'),
      active: window.location.pathname === '/galleries'
    },
    { 
      name: 'AI Generator', 
      icon: ImageIcon,
      onClick: () => navigate('/ai-generator'),
      active: window.location.pathname === '/ai-generator'
    },
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-gradient-to-b from-[#0A0A0A]/95 to-[#0A0A0A]/80 
        backdrop-blur-xl border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Logo />

          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <NavButton
                key={item.name}
                icon={item.icon}
                onClick={item.onClick}
                active={item.active}
              >
                {item.name}
              </NavButton>
            ))}
          </div>

          <div className="hidden md:block">
            <WalletButton />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-white/70 hover:text-white
              hover:bg-white/[0.05] transition-all duration-200"
          >
            <span className="text-2xl">{isMenuOpen ? '✕' : '☰'}</span>
          </motion.button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="md:hidden absolute left-0 right-0 mt-2 mx-4 p-4 
                bg-gradient-to-b from-[#1A1A1A] to-[#1A1A1A]/90 
                backdrop-blur-xl border border-white/10 rounded-xl
                shadow-lg shadow-black/20"
            >
              <div className="space-y-2">
                {navItems.map((item) => (
                  <NavButton
                    key={item.name}
                    icon={item.icon}
                    onClick={() => {
                      item.onClick();
                      setIsMenuOpen(false);
                    }}
                    active={item.active}
                  >
                    {item.name}
                  </NavButton>
                ))}
                <div className="pt-2 border-t border-white/10">
                  <WalletButton />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar; 