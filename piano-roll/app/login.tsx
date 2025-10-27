import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';

export default function LoginScreen() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const { login, register, isAuthenticated, isInitialized } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace('/piano-roll');
    }
  }, [isAuthenticated, isInitialized]);

  // Clear error when switching modes
  useEffect(() => {
    setErrorMessage('');
  }, [isRegistering]);

  const handleSubmit = async () => {
    setErrorMessage(''); // Clear previous errors

    if (!name.trim() || !password.trim()) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const result = isRegistering
        ? await register(name.trim(), password)
        : await login(name.trim(), password);

      if (result.success) {
        console.log('Auth successful, redirecting...');
        // useEffect will handle redirect
      } else {
        setErrorMessage(result.error || 'Authentication failed');
        setIsLoading(false);
      }
    } catch (error: any) {
      setErrorMessage('Something went wrong. Please try again.');
      setIsLoading(false);
      console.error('Unexpected error:', error);
    }
  };

  // Show loading while checking auth
  if (!isInitialized) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isRegistering ? 'Register' : 'Login'}</Text>

      {/* Error Message */}
      {errorMessage ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#666"
        value={name}
        onChangeText={(text) => {
          setName(text);
          setErrorMessage(''); // Clear error on input
        }}
        autoCapitalize="none"
        editable={!isLoading}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#666"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setErrorMessage(''); // Clear error on input
        }}
        secureTextEntry
        editable={!isLoading}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {isRegistering ? 'Register' : 'Login'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setIsRegistering(!isRegistering)}
        disabled={isLoading}
      >
        <Text style={styles.switchText}>
          {isRegistering
            ? 'Already have an account? Login'
            : "Don't have an account? Register"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    justifyContent: 'center',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    fontSize: 16,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#444',
  },
  button: {
    backgroundColor: '#8b5cf6',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  switchText: {
    color: '#8b5cf6',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
});