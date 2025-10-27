import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMusicStore } from "@/lib/store/use-music-store";
import { useEffect, useState } from "react";

// Helper to extract clean error message from Convex errors
function getErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  // Convex errors come wrapped
  if (error?.message) {
    // Extract the actual error message from Convex format
    const match = error.message.match(/Uncaught Error: (.+?)(?:\n|$)/);
    if (match) {
      return match[1];
    }
    return error.message;
  }

  return 'An unexpected error occurred';
}

export function useAuth() {
  const userName = useMusicStore((state) => state.userName);
  const token = useMusicStore((state) => state.token);
  const setAuth = useMusicStore((state) => state.setAuth);
  const clearAuth = useMusicStore((state) => state.clearAuth);
  const loadAuth = useMusicStore((state) => state.loadAuth);

  const [isInitialized, setIsInitialized] = useState(false);
  const [shouldVerify, setShouldVerify] = useState(false);

  const loginMutation = useMutation(api.auth.login);
  const registerMutation = useMutation(api.auth.register);
  const logoutMutation = useMutation(api.auth.logout);

  // Only verify token after we've loaded from storage AND have a token
  const verifiedUser = useQuery(
    api.auth.verifyToken,
    shouldVerify && token ? { token } : "skip"
  );

  // Load auth from storage on mount
  useEffect(() => {
    loadAuth().then(() => {
      setIsInitialized(true);
      setShouldVerify(true);
    });
  }, []);

  // If token verification fails, clear auth
  useEffect(() => {
    if (shouldVerify && token && verifiedUser === null) {
      console.log("Token invalid, clearing auth");
      clearAuth(); // This now also resets partition
    }
  }, [verifiedUser, token, shouldVerify]);

  const login = async (name: string, password: string) => {
    try {
      const result = await loginMutation({ name, password });
      await setAuth(result.name, result.token);
      setShouldVerify(true);
      return { success: true };
    } catch (error: any) {
      const message = getErrorMessage(error);
      console.error("Login error:", message);
      return { success: false, error: message };
    }
  };

  const register = async (name: string, password: string) => {
    try {
      const result = await registerMutation({ name, password });
      await setAuth(result.name, result.token);
      setShouldVerify(true);
      return { success: true };
    } catch (error: any) {
      const message = getErrorMessage(error);
      console.error("Register error:", message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    console.log("Logging out, resetting all data...");

    // Call server logout
    if (token) {
      try {
        await logoutMutation({ token });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }

    // Clear auth and reset all state (includes partition reset)
    await clearAuth();
    setShouldVerify(false);
  };

  const isAuthenticated = !!userName && !!token && (verifiedUser !== null || !shouldVerify);

  return {
    userName,
    token,
    isAuthenticated,
    isInitialized,
    login,
    register,
    logout
  };
}