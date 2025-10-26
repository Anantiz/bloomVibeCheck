import { Partition } from './core/music/partition';
import { MusicNoteObj, InstrumentType } from '@/types/core';

export type SerializedBeat = {
  beatIndex: number;
  pitch: number;
  velocity: number;
  instrument: string;
};

export function partitionToMidi(partition: Partition): SerializedBeat[] {
  const beats: SerializedBeat[] = [];

  const furthest = partition.furthestBeatIndex;
  for (let beatIndex = 0; beatIndex < furthest; beatIndex++) {
    const notes: MusicNoteObj[] | null = partition.getAllNotesAtBeat(beatIndex);
    if (!notes) continue;
    for (const note of notes) {
      beats.push({
        pitch: note.pitch,
        beatIndex: note.beatIndex,
        velocity: note.velocity,
        instrument: "piano" // Cheat this
      });
    }
  }
  return beats;
}

export function partitionFromMidi(
  beats: SerializedBeat[],
  bpm: number,
  name: string,
  creatorName: string
): Partition {
  const partition = new Partition(creatorName, name);

  for (const beat of beats) {
    partition.addNote(beat.pitch, beat.beatIndex, beat.velocity, InstrumentType.PIANO);
  }
  return partition;
}