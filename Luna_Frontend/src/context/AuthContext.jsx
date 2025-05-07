import React, { createContext, useState, useEffect, useContext } from "react";
import axiosInstance from "../utils/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (token) {
      axiosInstance
        .get("/api/auth/me")
        .then((response) => {
          setUser(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          localStorage.removeItem("token");
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);
  
  

  const login = (userData, token, refreshToken) => {
    setUser(userData);
    localStorage.setItem("token", token);
  };
// In your frontend's AuthContext.jsx
const fetchUser = async () => {
  try {
    const response = await axiosInstance.get('/auth/me'); // Note the /api prefix
    setUser(response.data);
  } catch (error) {
    console.error('Error fetching user data:', error);
    setUser(null);
    // Optional: Clear invalid token
    localStorage.removeItem('token');
  }
};
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
