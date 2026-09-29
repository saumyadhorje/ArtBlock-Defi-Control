import React from 'react';
import { motion } from 'framer-motion';

const FooterLink = ({ children }) => (
  <motion.a
    href="#"
    whileHover={{ x: 4 }}
    className="text-white/60 hover:text-white transition-colors duration-300 
      font-['Plus_Jakarta_Sans']"
  >
    {children}
  </motion.a>
);

const Footer = () => {
  const links = [
    {
      title: "Platform",
      items: ["Explore", "Create", "Marketplace", "About"]
    },
    {
      title: "Community",
      items: ["Discord", "Twitter", "Blog", "Help"]
    },
    {
      title: "Legal",
      items: ["Privacy", "Terms", "License"]
    }
  ];

  return (
    <footer className="relative bg-[#0A0A0A] overflow-hidden border-t border-white/10">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.5, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          className="absolute -top-1/2 -right-1/2 w-full h-full 
            bg-white/[0.02] rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="inline-block"
            >
              <motion.h2 
                className="text-3xl font-black text-white font-['Space_Grotesk']"
              >
                ArtBlock
              </motion.h2>
            </motion.div>

            <p className="text-white/60 font-['Outfit']">
              Transform your digital art into unique NFTs. 
              Build, collect, and trade with confidence.
            </p>

            {/* Social Links */}
            <div className="flex gap-6">
              {['Discord', 'Twitter', 'Instagram'].map((social, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ y: -4 }}
                  className="text-white/60 hover:text-[#6366F1] 
                    transition-colors duration-300"
                >
                  {social}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {links.map((column, i) => (
            <div key={i} className="lg:col-span-2 space-y-6">
              <h3 className="text-white font-bold font-['Space_Grotesk']">
                {column.title}
              </h3>
              <ul className="space-y-4">
                {column.items.map((link, j) => (
                  <li key={j}>
                    <FooterLink>{link}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-white/10">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="text-white/60 font-['Plus_Jakarta_Sans']">
              © 2024 ArtBlock. All rights reserved.
            </div>
            <div className="flex gap-8">
              {["Privacy Policy", "Terms", "Cookies"].map((link, i) => (
                <FooterLink key={i}>{link}</FooterLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 