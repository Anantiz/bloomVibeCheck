import { setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer as AudioPlayerType } from 'expo-audio';
const { AudioPlayer } = require('expo-audio'); // Runtime import

import { PITCH_COUNT, MIDI_PITCH, InstrumentType } from "../../../types/core";

// Static sample imports - Metro bundler requires these to be static
const PIANO_SAMPLES = {
  a1: require('./assets/samples/piano/a1.ogg'),
  a2: require('./assets/samples/piano/a2.ogg'),
  a3: require('./assets/samples/piano/a3.ogg'),
  a4: require('./assets/samples/piano/a4.ogg'),
  a5: require('./assets/samples/piano/a5.ogg'),
  a6: require('./assets/samples/piano/a6.ogg'),
  a7: require('./assets/samples/piano/a7.ogg'),
  b1: require('./assets/samples/piano/b1.ogg'),
  b2: require('./assets/samples/piano/b2.ogg'),
  b3: require('./assets/samples/piano/b3.ogg'),
  b4: require('./assets/samples/piano/b4.ogg'),
  b5: require('./assets/samples/piano/b5.ogg'),
  b6: require('./assets/samples/piano/b6.ogg'),
  b7: require('./assets/samples/piano/b7.ogg'),
  c1: require('./assets/samples/piano/c1.ogg'),
  c2: require('./assets/samples/piano/c2.ogg'),
  c3: require('./assets/samples/piano/c3.ogg'),
  c4: require('./assets/samples/piano/c4.ogg'),
  c5: require('./assets/samples/piano/c5.ogg'),
  c6: require('./assets/samples/piano/c6.ogg'),
  c7: require('./assets/samples/piano/c7.ogg'),
  c8: require('./assets/samples/piano/c8.ogg'),
  d1: require('./assets/samples/piano/d1.ogg'),
  d2: require('./assets/samples/piano/d2.ogg'),
  d3: require('./assets/samples/piano/d3.ogg'),
  d4: require('./assets/samples/piano/d4.ogg'),
  d5: require('./assets/samples/piano/d5.ogg'),
  d6: require('./assets/samples/piano/d6.ogg'),
  d7: require('./assets/samples/piano/d7.ogg'),
  e1: require('./assets/samples/piano/e1.ogg'),
  e2: require('./assets/samples/piano/e2.ogg'),
  e3: require('./assets/samples/piano/e3.ogg'),
  e4: require('./assets/samples/piano/e4.ogg'),
  e5: require('./assets/samples/piano/e5.ogg'),
  e6: require('./assets/samples/piano/e6.ogg'),
  e7: require('./assets/samples/piano/e7.ogg'),
  f1: require('./assets/samples/piano/f1.ogg'),
  f2: require('./assets/samples/piano/f2.ogg'),
  f3: require('./assets/samples/piano/f3.ogg'),
  f4: require('./assets/samples/piano/f4.ogg'),
  f5: require('./assets/samples/piano/f5.ogg'),
  f6: require('./assets/samples/piano/f6.ogg'),
  f7: require('./assets/samples/piano/f7.ogg'),
  g1: require('./assets/samples/piano/g1.ogg'),
  g2: require('./assets/samples/piano/g2.ogg'),
  g3: require('./assets/samples/piano/g3.ogg'),
  g4: require('./assets/samples/piano/g4.ogg'),
  g5: require('./assets/samples/piano/g5.ogg'),
  g6: require('./assets/samples/piano/g6.ogg'),
  g7: require('./assets/samples/piano/g7.ogg'),
};

interface PlayerPool {
  player: AudioPlayerType;
  inUse: boolean;
}

class Instrument {
  private players: Map<number, PlayerPool[]> = new Map();
  private name: string;
  private sampleMap: Map<number, any>; // Maps MIDI pitch to require() asset
  private isLoaded: boolean = false;
  private readonly POOL_SIZE = 3; // Number of simultaneous instances per note

  private constructor(name: string) {
    this.name = name;
    this.sampleMap = new Map();
  }

  /**
   * Static factory method to properly initialize instrument
   */
  public static async create(name: string, samples: Record<string, any>): Promise<Instrument> {
    const instrument = new Instrument(name);
    await instrument.init(samples);
    return instrument;
  }

  private async init(samples: Record<string, any>): Promise<void> {
    // Map each available sample to its MIDI pitch
    for (const [noteName, asset] of Object.entries(samples)) {
      const midiPitch = MIDI_PITCH[noteName];
      if (midiPitch !== undefined) {
        this.sampleMap.set(midiPitch, asset);
      }
    }

    // Fill missing samples (sharps/flats) by mapping to nearest natural note
    this.fillMissingSamples();

    // Pre-create player pools for each note
    await this.createPlayerPools();

    this.isLoaded = true;
  }

  private fillMissingSamples(): void {
    const startPitch = MIDI_PITCH['a1']; // 21
    const endPitch = MIDI_PITCH['c8'];   // 108

    for (let pitch = startPitch; pitch <= endPitch; pitch++) {
      if (!this.sampleMap.has(pitch)) {
        // Find nearest available sample
        let nearestPitch = this.findNearestAvailablePitch(pitch);
        if (nearestPitch !== null) {
          const nearestAsset = this.sampleMap.get(nearestPitch);
          this.sampleMap.set(pitch, nearestAsset);
        }
      }
    }
  }

  private findNearestAvailablePitch(targetPitch: number): number | null {
    let minDistance = Infinity;
    let nearestPitch: number | null = null;

    for (const availablePitch of this.sampleMap.keys()) {
      const distance = Math.abs(targetPitch - availablePitch);
      if (distance < minDistance) {
        minDistance = distance;
        nearestPitch = availablePitch;
      }
    }

    return nearestPitch;
  }

  private async createPlayerPools(): Promise<void> {
    for (const [pitch, asset] of this.sampleMap) {
      const pool: PlayerPool[] = [];

      for (let i = 0; i < this.POOL_SIZE; i++) {
        const player = new AudioPlayer(asset, 100, false);
        pool.push({ player, inUse: false });
      }

      this.players.set(pitch, pool);
    }
  }

  /**
   * Play a note by MIDI pitch
   * @param pitch MIDI pitch number (21-108)
   */
  public async playNote(pitch: number): Promise<void> {
    if (!this.isLoaded) {
      console.warn('Instrument not loaded yet');
      return;
    }

    const pool = this.players.get(pitch);
    if (!pool) {
      console.warn(`No sample available for pitch ${pitch}`);
      return;
    }

    // Find an available player from the pool
    let availablePlayer = pool.find(p => !p.inUse);

    if (!availablePlayer) {
      // All players busy, reuse the first one (stop it and restart)
      availablePlayer = pool[0];
      try {
        availablePlayer.player.pause();
        availablePlayer.player.seekTo(0);
      } catch (error) {
        // Ignore errors if player wasn't playing
      }
    }

    // Mark as in use
    availablePlayer.inUse = true;

    try {
      // Reset to beginning and play
      availablePlayer.player.seekTo(0);
      availablePlayer.player.play();

      // Set up completion handler using the player's current time tracking
      const checkCompletion = () => {
        if (!availablePlayer) return;

        const status = availablePlayer.player.currentStatus;

        // Check if playback has finished
        if (status && 'duration' in status && 'currentTime' in status) {
          const isFinished = status.currentTime >= status.duration - 0.05; // 50ms tolerance

          if (isFinished || !availablePlayer.player.playing) {
            availablePlayer.inUse = false;
          } else {
            // Check again in 100ms
            setTimeout(checkCompletion, 100);
          }
        } else {
          // Fallback: assume 3 second duration if status unavailable
          setTimeout(() => {
            if (availablePlayer) {
              availablePlayer.inUse = false;
            }
          }, 3000);
        }
      };

      // Start checking for completion
      setTimeout(checkCompletion, 100);

    } catch (error) {
      console.error(`Failed to play note ${pitch}:`, error);
      availablePlayer.inUse = false;
    }
  }

  /**
   * Stop all currently playing notes
   */
  public async stopAll(): Promise<void> {
    for (const pool of this.players.values()) {
      for (const { player } of pool) {
        try {
          player.pause();
          player.seekTo(0);
        } catch (error) {
          // Ignore errors
        }
      }
    }
  }

  public isReady(): boolean {
    return this.isLoaded;
  }
}

// Singleton Instrument Manager
class InstrumentManager {
  private static instance: InstrumentManager;
  private instruments: Map<InstrumentType, Instrument> = new Map();
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): InstrumentManager {
    if (!InstrumentManager.instance) {
      InstrumentManager.instance = new InstrumentManager();
    }
    return InstrumentManager.instance;
  }

  /**
   * Initialize the audio system (call this once at app startup)
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Set audio mode for iOS
    await setAudioModeAsync({
      playsInSilentMode: true,
    });

    await this.initializeInstruments();
    this.isInitialized = true;
  }

  private async initializeInstruments(): Promise<void> {
    const piano = await Instrument.create("Piano", PIANO_SAMPLES);
    this.instruments.set(InstrumentType.PIANO, piano);
  }

  public getInstrument(instrumentType: InstrumentType): Instrument {
    const instrument = this.instruments.get(instrumentType);
    if (!instrument) {
      const defaultInstrument = this.instruments.get(InstrumentType.PIANO);
      if (!defaultInstrument) {
        throw new Error("No instruments available");
      }
      return defaultInstrument;
    }
    return instrument;
  }

  /**
   * Play a note using MIDI pitch
   * @param instrumentType The type of instrument
   * @param pitch MIDI pitch number (21-108)
   */
  public async playNote(
    instrumentType: InstrumentType,
    pitch: number
  ): Promise<void> {
    if (!this.isInitialized) {
      console.warn('InstrumentManager not initialized. Call initialize() first.');
      return;
    }

    const instrument = this.getInstrument(instrumentType);
    await instrument.playNote(pitch);
  }

  /**
   * Stop all playing notes for an instrument
   */
  public async stopAllNotes(instrumentType: InstrumentType): Promise<void> {
    const instrument = this.getInstrument(instrumentType);
    await instrument.stopAll();
  }
}

// Export singleton instance getter and convenience function
export const getInstrumentManager = () => InstrumentManager.getInstance();

/**
 * Convenience function to play a note
 * @param instrumentType The type of instrument
 * @param pitch MIDI pitch number (21-108)
 */
export async function playNote(
  instrumentType: InstrumentType,
  pitch: number
): Promise<void> {
  const manager = InstrumentManager.getInstance();
  await manager.playNote(instrumentType, pitch);
}

export { Instrument, InstrumentManager };
export default InstrumentManager;