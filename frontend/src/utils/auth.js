export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'artblock_token',
  USER: 'artblock_user',
  WALLET: 'artblock_wallet'
};

export const getToken = () => localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);

export const getUser = () => {
  const userStr = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
  return userStr ? JSON.parse(userStr) : null;
};

export const getWalletAddress = () => localStorage.getItem(LOCAL_STORAGE_KEYS.WALLET);

export const setUserSession = (token, user) => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
};

export const clearUserSession = () => {
  const walletAddress = getWalletAddress();
  localStorage.clear();
  if (walletAddress) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.WALLET, walletAddress);
  }
};

export const isAuthenticated = () => {
  const token = getToken();
  const user = getUser();
  return !!(token && user);
}; 