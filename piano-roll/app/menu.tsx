import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LoadPartitionOverlay from '@/components/LoadPartitionOverlay';
import SavePartitionOverlay from '@/components/SavePartitionOverlay';
import { useAuth } from '@/hooks/use-auth';

export default function MenuScreen() {
  const router = useRouter();
  const [showLoadOverlay, setShowLoadOverlay] = useState(false);
  const [showSaveOverlay, setShowSaveOverlay] = useState(false);

  const { userName, logout } = useAuth();

  const handleLogout = async () => {
    try {
      console.log("Starting logout...");
      await logout();
      console.log("Logout complete, navigating to login...");
      router.replace('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Semi-transparent background */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={() => router.back()}
      />

      {/* Menu content */}
      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={32} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>Menu</Text>

        {userName && (
          <Text style={styles.userName}>Logged in as: {userName}</Text>
        )}

        {/* LOAD button */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setShowLoadOverlay(true)}
        >
          <Ionicons name="download-outline" size={24} color="#8b5cf6" />
          <Text style={styles.menuText}>Load Partition</Text>
        </TouchableOpacity>

        {/* SAVE button */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setShowSaveOverlay(true)}
        >
          <Ionicons name="save-outline" size={24} color="#8b5cf6" />
          <Text style={styles.menuText}>Save Partition</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.logoutItem]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Overlays */}
      {showLoadOverlay && userName && (
        <LoadPartitionOverlay
          userName={userName}
          onClose={() => setShowLoadOverlay(false)}
        />
      )}
      {showSaveOverlay && userName && (
        <SavePartitionOverlay
          userName={userName}
          onClose={() => setShowSaveOverlay(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menu: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  userName: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    marginBottom: 10,
  },
  menuText: {
    fontSize: 18,
    color: '#fff',
    marginLeft: 15,
  },
  logoutItem: {
    marginTop: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  logoutText: {
    color: '#ef4444',
  },
});