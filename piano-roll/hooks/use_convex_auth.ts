// hooks/use-convex-auth.ts
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAuth() {
  const [user, setUser] = useState<{name: string} | null>(null);
  const loginMutation = useMutation(api.auth.login);
  const registerMutation = useMutation(api.auth.register);

  const login = async (name: string, password: string) => {
    const result = await loginMutation({ name, password });
    await AsyncStorage.setItem('user', JSON.stringify(result));
    setUser(result);
  };

  const register = async (name: string, password: string) => {
    const result = await registerMutation({ name, password });
    await AsyncStorage.setItem('user', JSON.stringify(result));
    setUser(result);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  // Load user on mount
  useState(() => {
    AsyncStorage.getItem('user').then(data => {
      if (data) setUser(JSON.parse(data));
    });
  });

  return { user, login, register, logout };
}

