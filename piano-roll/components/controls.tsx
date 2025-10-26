// components/Controls.tsx
import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useMusicStore, PITCH_STEP, BEAT_STEP } from '../lib/store/use_music_store';
import { startPlayback, stopPlayback } from '../lib/audio/playback_engine';

export function Controls() {
const {
    moveCenterPitch,
    moveBeatOffset,
    partition,
    isPlaying,
    setPlaying,
} = useMusicStore();

const handlePlay = () => {
    startPlayback(partition);
    setPlaying(true);
};

const handleStop = () => {
    stopPlayback();
    setPlaying(false);
};

const handleMenuOverlay = () => {
    // TODO: Implement overlay
    console.log('Open menu overlay');
};

return (
    <View style={styles.container}>
    <View style={styles.row}>
        <ControlButton
        label="↑ Pitch"
        onPress={() => moveCenterPitch(PITCH_STEP)}
        />
        <ControlButton
        label="↓ Pitch"
        onPress={() => moveCenterPitch(-PITCH_STEP)}
        />
    </View>

    <View style={styles.row}>
        <ControlButton
        label="← Beat"
        onPress={() => moveBeatOffset(-BEAT_STEP)}
        />
        <ControlButton
        label="→ Beat"
        onPress={() => moveBeatOffset(BEAT_STEP)}
        />
    </View>

    <View style={styles.row}>
        <ControlButton
        label={isPlaying ? "⏸ Pause" : "▶ Play"}
        onPress={isPlaying ? handleStop : handlePlay}
        primary
        />
        <ControlButton
        label="⏹ Stop"
        onPress={handleStop}
        />
        <ControlButton
        label="☰ Menu"
        onPress={handleMenuOverlay}
        />
    </View>
    </View>
);
}

interface ControlButtonProps {
label: string;
onPress: () => void;
primary?: boolean;
}

function ControlButton({ label, onPress, primary }: ControlButtonProps) {
return (
    <Pressable
    style={[styles.button, primary && styles.primaryButton]}
    onPress={onPress}
    >
    <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
);
}

const styles = StyleSheet.create({
container: {
    padding: 10,
    backgroundColor: '#2a2a2a',
},
row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 5,
},
button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#3a3a3a',
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
},
primaryButton: {
    backgroundColor: '#4ade80',
},
buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
},
});