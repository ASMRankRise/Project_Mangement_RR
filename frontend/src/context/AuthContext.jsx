import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);
const CHANNEL_NAME = "auth-channel";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  const checkAuth = useCallback(async () => {
    try {
      let response;

      try {
        response = await api.get("/auth/me");
      } catch (error) {
        if (error.response?.status !== 401) {
          throw error;
        }

        await api.post("/auth/refresh");
        response = await api.get("/auth/me");
      }

      setUser(response.data.user || null);
      return response.data.user || null;
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error("Session check failed:", error);
      }

      setUser(null);
      return null;
    } finally {
      setAuthChecking(false);
    }
  }, []);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME);

    channel.onmessage = async (event) => {
      if (event.data?.type === "logout") {
        setUser(null);
        setAuthError("");
        setAuthSuccess("");
      }

      if (event.data?.type === "login") {
        setAuthError("");
        setAuthSuccess("");
        await checkAuth();
      }
    };

    return () => {
      channel.close();
    };
  }, [checkAuth]);

  const authenticate = async (mode, payload) => {
    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";

      await api.post(endpoint, payload);

      if (mode === "register") {
        setAuthSuccess("Registration successful. Please log in.");
        return true;
      }

      const response = await api.get("/auth/me");
      const authenticatedUser = response.data.user;

      setUser(authenticatedUser);

      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({ type: "login" });
      channel.close();

      return authenticatedUser;
    } catch (error) {
      setAuthError(
        error.response?.data?.message || "Authentication request failed.",
      );

      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);

    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout API failed:", error);

      setAuthError(error.response?.data?.message || "Logout request failed.");
    } finally {
      setUser(null);
      setAuthSuccess("");
      setAuthLoading(false);

      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({ type: "logout" });
      channel.close();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        authChecking,
        authLoading,
        authError,
        authSuccess,
        setAuthError,
        setAuthSuccess,
        checkAuth,
        authenticate,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
