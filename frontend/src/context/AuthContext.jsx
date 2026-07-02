import React from "react";
// frontend/src/context/AuthContext.jsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authAPI } from "../services/api";
import { initializeSocket, disconnectSocket } from "../socket";

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

function extractAuthPayload(response) {
  const data = response?.data ?? response;
  return {
    token: data?.token,
    user: data?.user,
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // ✅ Initialize socket when user is authenticated
  useEffect(() => {
    if (token && user) {
      initializeSocket(user.id);
      console.log("🔌 Socket initialized for user:", user.id);
    } else {
      disconnectSocket();
    }
  }, [token, user]);

  const persistSession = useCallback((nextUser, nextToken) => {
    if (nextToken) {
      localStorage.setItem("token", nextToken);
      setToken(nextToken);
    }

    if (nextUser) {
      localStorage.setItem("user", JSON.stringify(nextUser));
      setUser(nextUser);
    }
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    disconnectSocket(); // ✅ Disconnect socket on logout
  }, []);

  const login = useCallback(
    async (credentials) => {
      const response = await authAPI.login(credentials);
      const payload = extractAuthPayload(response);

      persistSession(payload.user, payload.token);

      // ✅ Initialize socket after login
      if (payload.user && payload.token) {
        initializeSocket(payload.user.id);
      }

      return payload.user;
    },
    [persistSession],
  );

  const register = useCallback(async (payload) => {
    const response = await authAPI.register(payload);
    const authPayload = extractAuthPayload(response);
    return authPayload.user ?? response.data?.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearSession();
    }
  }, [clearSession, token]);

  const getProfile = useCallback(async () => {
    const response = await authAPI.getProfile();
    const nextUser = response.data?.user;

    if (nextUser) {
      localStorage.setItem("user", JSON.stringify(nextUser));
      setUser(nextUser);
    }

    return nextUser;
  }, []);

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      setLoading(false);
      return null;
    }

    try {
      const userData = await getProfile();
      // ✅ Re-initialize socket if user exists
      if (userData) {
        initializeSocket(userData.id);
      }
      return userData;
    } catch (error) {
      if (error.response?.status === 401) {
        clearSession();
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearSession, getProfile]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession();
    };

    window.addEventListener("mini-jira:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("mini-jira:unauthorized", handleUnauthorized);
    };
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      getProfile,
      refreshUser,
    }),
    [user, token, loading, login, register, logout, getProfile, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
