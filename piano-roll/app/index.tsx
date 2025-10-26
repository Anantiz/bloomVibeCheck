import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

export default function Index() {
  // TODO: Replace with your actual auth logic
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (check AsyncStorage, SecureStore, etc.)
    async function checkAuth() {
      try {
        // Example: const token = await SecureStore.getItemAsync('userToken');
        // setIsAuthenticated(!!token);
        setIsAuthenticated(false); // Default to false for now
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  if (isLoading) {
    return null; // Or a loading screen
  }

  // Redirect based on auth state
  return <Redirect href={isAuthenticated ? "/piano_roll" : "/login"} />;
}