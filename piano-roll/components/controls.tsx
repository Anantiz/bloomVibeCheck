// components/controls.tsx
import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useMusicStore, PITCH_STEP, BEAT_STEP } from '../lib/store/use-music-store';
import { startPartitionPlayback, stopPartitionPlayback } from '../lib/audio/sound_engine';

// What if both handlePlay and handleStop are called in the same tick...
// General: "Are we saying there's a chance that when we push that button... we destroy the world?"
// Oppenheimer: "The chances are near zero."
// General: "Near zero?"
// Oppenheimer: "What do you want from theory alone?"
// General: "Zero would be nice!"

export function Controls() {
    const {
        moveCenterPitch,
        moveBeatOffset,
        partition,
        isPlaying,
        setPlaying,
        playbackController,
        setPlaybackController,
    } = useMusicStore();


    const handlePlay = () => {
        if (isPlaying) {
            return; // Already playing
        }
        // Fully synchronous - just create controller and update state
        const controller = startPartitionPlayback(partition);
        setPlaybackController(controller);
        setPlaying(true);
    };

    const handleStop = () => {
        // Fully synchronous - just cancel and update state
        stopPartitionPlayback(playbackController);
        setPlaybackController(null);
        setPlaying(false);
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
        flex: 1,
        marginHorizontal: 5,
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