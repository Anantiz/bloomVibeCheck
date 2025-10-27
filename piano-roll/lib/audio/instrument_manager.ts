import {PartitionRenderer} from './partition_renderer';
import { setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer as AudioPlayerType } from 'expo-audio';
const { AudioPlayer } = require('expo-audio');
import { Asset } from 'expo-asset';

import { Instrument } from './instrument';
import { MIDI_PITCH, InstrumentType} from "../../types/core";
import { Partition } from '../core/music/partition';

import { PIANO_SAMPLES_PATH } from '@/lib/sample_paths';



export class InstrumentManager {
  private static instance: InstrumentManager;
  private instruments: Map<InstrumentType, Instrument> = new Map();
  private isInitialized: boolean = false;
  private partitionRenderer: PartitionRenderer | null = null; // why the AI made the InstrumentManager depend on PartitionRenderer idk. Makes more sense that the PartitionRenderer calls the InstrumentManager to get samples/instruments

  private constructor() {}

  public static getInstance(): InstrumentManager {
    if (!InstrumentManager.instance) {
      InstrumentManager.instance = new InstrumentManager();
    }
    return InstrumentManager.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await setAudioModeAsync({
      playsInSilentMode: true,
    });

    await this.initializeInstruments();

    // Create partition renderer
    this.partitionRenderer = new PartitionRenderer(this);

    this.isInitialized = true;
  }

  private async initializeInstruments(): Promise<void> {

    const piano = await Instrument.create("Piano", PIANO_SAMPLES_PATH);
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

  // Could add return an actual audioCallback or something and cancel the sound if the pressed key is released; No time tho. Fine as is
  public async playNote(
    instrumentType: InstrumentType,
    pitch: number
  ): Promise<void> {
    if (!this.isInitialized) {
      console.warn('InstrumentManager not initialized.');
      return;
    }

    const instrument = this.getInstrument(instrumentType);
    await instrument.playNote(pitch);
  }

  public async stopAllNotes(instrumentType: InstrumentType): Promise<void> {
    const instrument = this.getInstrument(instrumentType);
    await instrument.stopAll();
  }

  /**
   * NEW: Render partition to audio file
   */
  public async renderPartition(
    partition: Partition,
    bpm: number
  ): Promise<{ uri: string; duration: number }> {
    if (!this.partitionRenderer) {
      throw new Error('PartitionRenderer not initialized');
    }
    return this.partitionRenderer.renderPartition(partition, bpm);
  }
}