import { Platform } from 'react-native';
import { decodeSampleToPCM } from './decoder';
import { createAudioPlayer } from 'expo-audio';

import { MIDI_PITCH, InstrumentType } from "../../types/core";

// PCM = Pulse Code Modulation - Imagine PWM but for the other way around

export class Instrument {
  private name: string;
  private sampleMap: Map<number, any> = new Map();

  // Pre-decoded PCM buffers for rendering
  private pcmBuffers: Map<number, Float32Array> = new Map();
  private sampleRate: number = 44100;

  private isLoaded: boolean = false;

  private constructor(name: string) {
    this.name = name;
  }

  public static async create(name: string, samples: Record<string, string>): Promise<Instrument> {
    const instrument = new Instrument(name);
    await instrument.init(samples);
    return instrument;
  }

  private async init(samples: Record<string, string>): Promise<void> {
    console.log(`Loading instrument: ${this.name}`);
    // Map each available sample to its MIDI pitch
    for (const [noteName, asset] of Object.entries(samples)) {
      const midiPitch = MIDI_PITCH[noteName];
      if (midiPitch !== undefined) {
        this.sampleMap.set(midiPitch, asset);
      }
    }

    console.log(`Filling missing samples...`);
    this.fillMissingSamples();

    console.log(`Decoding samples it might take SUPER LONG...`);
    await this.inst_decodeSamplesToPCM();

    this.isLoaded = true;
    console.log(`Instrument loaded: ${this.name}`);
  }

  private async inst_decodeSamplesToPCM(): Promise<void> {
    console.log(`Decoding samples on ${Platform.OS}...`);

    for (const [pitch, asset] of this.sampleMap.entries()) {
      const result = await decodeSampleToPCM(asset);

      if (result) {
        this.pcmBuffers.set(pitch, result.pcmData);
        this.sampleRate = result.sampleRate;
      } else {
        console.error(`Failed to decode PCM for pitch ${pitch}`);
      }
    }
  }

  /**
   * Get decoded PCM buffer for a pitch
   */
  public getPCMBuffer(pitch: number): Float32Array | null {
    return this.pcmBuffers.get(pitch) || null;
  }

  public getSampleRate(): number {
    return this.sampleRate;
  }

  private fillMissingSamples(): void {
    const startPitch = MIDI_PITCH['a1'];
    const endPitch = MIDI_PITCH['c8'];

    for (let pitch = startPitch; pitch <= endPitch; pitch++) {
      if (!this.sampleMap.has(pitch)) {
        const nearestPitch = this.findNearestAvailablePitch(pitch);
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

  public async playNote(pitch: number): Promise<void> {
    if (!this.isLoaded) {
      console.warn('Instrument not loaded yet');
      return;
    }

    const asset = this.sampleMap.get(pitch);
    if (!asset) {
      console.warn(`No sample available for pitch ${pitch}`);
      return;
    }

    try {
      // Create a new player for each note
      const player = createAudioPlayer(asset);
      player.volume = 1.0;
      player.play();

      // Player will be garbage collected automatically when done
    } catch (error) {
      console.error(`Failed to play note ${pitch}:`, error);
    }
  }

  public async stopAll(): Promise<void> {
    // No players to stop since we don't keep references
    console.log('No persistent players to stop');
  }

  public isReady(): boolean {
    return this.isLoaded;
  }
}