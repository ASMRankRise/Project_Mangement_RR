import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);
const LOGOUT_KEY = "auth_logout_event";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  const getUserId = (authenticatedUser) =>
    authenticatedUser?._id || authenticatedUser?.id || null;

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

      const authenticatedUser = response.data.user || null;
      setUser(authenticatedUser);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error("Session check failed:", error);
      }

      setUser(null);
    } finally {
      setAuthChecking(false);
    }
  }, []);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === LOGOUT_KEY && event.newValue) {
        setUser(null);
        setAuthError("");
        setAuthSuccess("");
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

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

      try {
        localStorage.setItem(LOGOUT_KEY, String(Date.now()));
      } catch (error) {
        console.error("Could not notify other tabs:", error);
      }
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
