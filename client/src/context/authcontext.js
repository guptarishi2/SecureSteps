// AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';

// Create AuthContext
const AuthContext = createContext();

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  // Check if user is saved in localStorage on load
  const getUserFromLocalStorage = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  const [user, setUser] = useState(getUserFromLocalStorage); // Initialize user state

  // Save user data to localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Function to login (simulate API call)
  const login = async (username, phone) => {
    const fakeUser = { username , phone}; // Simulate token
    setUser(fakeUser); // Set user data in state
    localStorage.setItem('user', JSON.stringify(fakeUser)); // Store in localStorage
    return fakeUser;
  };

  // Function to logout
  const logout = () => {
    setUser(null); // Clear user data from state
    localStorage.removeItem('user'); // Remove from localStorage
  };

  const value = {
    user,
    login,
    logout,
    isLoggedIn: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
