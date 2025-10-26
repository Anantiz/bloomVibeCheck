import { setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer as AudioPlayerType } from 'expo-audio';
const { AudioPlayer } = require('expo-audio');
import { Asset } from 'expo-asset';

import { MIDI_PITCH, InstrumentType } from "../../types/core";
import { InstrumentManager } from '../audio/instrument_manager';
import { trimPCMBuffer, mixPCMBuffers, encodeWAV, saveWAVToFile } from './utilities';

interface NoteData {
  pitch: number;
  beatIndex: number;
  instrument: InstrumentType;
}

interface Partition {
  getAllNotesAtBeat(beatIndex: number): NoteData[] | null;
  furthestBeatIndex: number;
}

/**
 * This takes a Partition and renders it to a WAV file using the InstrumentManager.
 * We do this in a single shot instead of real-time cuz streaming audio to without native code is a pain.
 */
export class PartitionRenderer {
  private instrumentManager: InstrumentManager;

  constructor(instrumentManager: InstrumentManager) {
    this.instrumentManager = instrumentManager;
  }

  /**
   * Render a partition to a WAV file
   * @param partition The partition to render
   * @param bpm Beats per minute
   * @returns URI of the generated WAV file and total duration
   */
  public async renderPartition(
    partition: Partition,
    bpm: number
  ): Promise<{ uri: string; duration: number }> {
    const beatDurationSec = 60.0 / bpm;
    const endBeatIndex = partition.furthestBeatIndex;

    // Get sample rate from default instrument
    const defaultInstrument = this.instrumentManager.getInstrument(InstrumentType.PIANO);
    const sampleRate = defaultInstrument.getSampleRate();

    // Calculate total samples needed
    const totalDuration = (endBeatIndex + 1) * beatDurationSec;
    const totalSamples = Math.ceil(totalDuration * sampleRate);
    const masterBuffer = new Float32Array(totalSamples);

    // Render each beat
    for (let beatIndex = 0; beatIndex <= endBeatIndex; beatIndex++) {
    const notes = partition.getAllNotesAtBeat(beatIndex);
      if (notes === null) {
        console.log(`No more notes at beat index ${beatIndex}, stopping rendering.`);
        break;
      }
      if (!notes || notes.length === 0) {
        continue; // Empty beat
      }

      // Get PCM buffers for all notes at this beat
      const notePCMBuffers: Float32Array[] = [];

      for (const note of notes) {
        // const instrument = this.instrumentManager.getInstrument(note.instrument);
        // We only have a Piano for now. Let's save a few cycles to outweight the dogshit re-draw of the screen I made
        const pcmBuffer = defaultInstrument.getPCMBuffer(note.pitch);

        if (pcmBuffer) {
          const trimmed = trimPCMBuffer(pcmBuffer, beatDurationSec, sampleRate);
          notePCMBuffers.push(trimmed);
        }
      }

      // Mix all notes for this beat
      if (notePCMBuffers.length > 0) {
        const mixedBeat = mixPCMBuffers(notePCMBuffers);
        // Write mixed beat to master buffer at correct position
        const startSample = Math.floor(beatIndex * beatDurationSec * sampleRate); // this scares me, are we in boudnds?
        for (let i = 0; i < mixedBeat.length && (startSample + i) < totalSamples; i++) {
          masterBuffer[startSample + i] += mixedBeat[i];
        }
      }
    }

    // Normalize master buffer to prevent clipping
    let maxAmplitude = 0;
    for (let i = 0; i < masterBuffer.length; i++) {
      maxAmplitude = Math.max(maxAmplitude, Math.abs(masterBuffer[i]));
    }
    if (maxAmplitude > 1.0) {
      const scale = 0.95 / maxAmplitude; // Leave some headroom
      for (let i = 0; i < masterBuffer.length; i++) {
        masterBuffer[i] *= scale;
      }
    }

    // Encode as WAV
    const wavData = encodeWAV(masterBuffer, sampleRate);

    // Save to file
    const uri = await saveWAVToFile(wavData);

    return { uri, duration: totalDuration };
  }
}