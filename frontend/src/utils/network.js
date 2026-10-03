export const HARDHAT_CHAIN_ID_HEX = '0x7a69'; // 31337 in hex
export const HARDHAT_CHAIN_ID_DECIMAL = 31337;

export const HARDHAT_NETWORK_PARAMS = {
  chainId: HARDHAT_CHAIN_ID_HEX,
  chainName: 'Hardhat Localhost',
  rpcUrls: ['http://127.0.0.1:8545'],
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
};

/**
 * Ensures MetaMask is connected to the local Hardhat network (Chain ID 31337).
 * Switches or prompts user to add/switch network if connected to another network.
 */
export const ensureHardhatNetwork = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed. Please install MetaMask to proceed.');
  }

  try {
    const currentChainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
    const currentChainIdDecimal = parseInt(currentChainIdHex, 16);

    if (currentChainIdDecimal === HARDHAT_CHAIN_ID_DECIMAL) {
      return true;
    }

    console.log(`Current chainId (${currentChainIdDecimal}) is not Hardhat Local (${HARDHAT_CHAIN_ID_DECIMAL}). Switching network...`);

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: HARDHAT_CHAIN_ID_HEX }],
      });
      return true;
    } catch (switchError) {
      // 4902 error code means network is missing from MetaMask
      if (
        switchError.code === 4902 ||
        switchError?.data?.originalError?.code === 4902 ||
        (switchError?.message && switchError.message.includes('Unrecognized chain ID'))
      ) {
        console.log('Hardhat network not found in MetaMask. Adding network...');
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [HARDHAT_NETWORK_PARAMS],
        });
        return true;
      }
      throw switchError;
    }
  } catch (error) {
    console.error('Failed to switch to Hardhat network:', error);
    throw new Error(
      error.message || 'Please switch your MetaMask network to Hardhat Localhost (http://127.0.0.1:8545, Chain ID 31337).'
    );
  }
};
