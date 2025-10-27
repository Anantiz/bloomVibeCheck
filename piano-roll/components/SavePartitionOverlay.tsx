import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePartitions } from '../hooks/use-partitions';
import { useMusicStore } from '@/lib/store/use-music-store';

interface SavePartitionOverlayProps {
  userName: string;
  onClose: () => void;
}

export default function SavePartitionOverlay({ userName, onClose }: SavePartitionOverlayProps) {
  const [name, setName] = useState('');
  const [bpm, setBpm] = useState('120');
  const [saving, setSaving] = useState(false);

  const { savePartition } = usePartitions(userName);
  const partition = useMusicStore((state) => state.partition);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name for your partition');
      return;
    }

    const bpmNumber = parseInt(bpm);
    if (isNaN(bpmNumber) || bpmNumber < 20 || bpmNumber > 300) {
      Alert.alert('Error', 'BPM must be between 20 and 300');
      return;
    }

    setSaving(true);
    try {
      await savePartition(partition, name.trim(), bpmNumber);
      Alert.alert('Success', 'Partition saved successfully!');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save partition');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.overlayContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Save Partition</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Partition Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter name..."
            placeholderTextColor="#666"
            autoFocus
          />

          <Text style={styles.label}>BPM</Text>
          <TextInput
            style={styles.input}
            value={bpm}
            onChangeText={setBpm}
            placeholder="120"
            placeholderTextColor="#666"
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Ionicons name="save-outline" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  overlayContent: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    width: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 5,
  },
  form: {
    gap: 15,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: 16,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b5cf6',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});