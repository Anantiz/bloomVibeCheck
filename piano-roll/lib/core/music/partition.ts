// lib/core/Partition.ts
import { NotesArenaAllocator } from './music_note';
import { PITCH_COUNT, MAX_PARTITION_LEN, InstrumentType, MusicNoteObj } from '../../../types/core'; // ../../../ For fucking real ?!

export class Partition {

public creator: string;
public name: string;
private beatsGrid: Array<Array<number>>; // 2D Array for light-weight beat grid (pointers to MusicNotes); Could be more optimized with bitsets
private arenaAllocator: NotesArenaAllocator; // Dynamic Heavy Objects

constructor(creator: string, name: string) {
    this.creator = creator;
    this.name = name;
    this.beatsGrid = Array.from({ length: PITCH_COUNT }, () => Array(MAX_PARTITION_LEN).fill(-1));
    this.arenaAllocator = new NotesArenaAllocator();
}

/**
 *
 * @param pitch: The note pitch 0-(PITCH_COUNT-1) == 0-87
 * @param position: The note position in the partition 0-(MAX_PARTITION_LEN-1)
 * @param velocity: The note velocity (0-127)
 * @param instrument: The instrument type
 */
public addNote(pitch: number, position: number, velocity: number, instrument: InstrumentType): void {
    if (pitch < 0 || pitch >= PITCH_COUNT || position < 0 || position >= MAX_PARTITION_LEN) {
        throw new Error('Invalid pitch or position');
    }
    // If note exists overwrite it, otherwise add new
    const existingArenaIndex: number = this.beatsGrid[pitch][position];
    if (existingArenaIndex !== -1) {
        this.arenaAllocator.allocate(
            pitch, position, velocity, instrument, existingArenaIndex
        );
    } else {
        this.beatsGrid[pitch][position] = this.arenaAllocator.allocate(
            pitch, position, velocity, instrument
        );
    }

}

/**
 * Removes a note from the partition.
 * @param pitch The pitch of the note to remove.
 * @param position The position of the note to remove.
 */
public removeNoteAt(pitch: number, position: number): void {
    if (pitch < 0 || pitch >= PITCH_COUNT || position < 0 || position >= MAX_PARTITION_LEN) {
        throw new Error('Invalid pitch or position');
    }
    const notePtr = this.beatsGrid[pitch][position];
    if (notePtr !== -1) {
        this.arenaAllocator.free(notePtr);
        this.beatsGrid[pitch][position] = -1;
    }
}

/**
 * If the note exists it returns MusicNoteObj else null
 */
public getNoteAt(pitch: number, position: number): MusicNoteObj | null {
    if (pitch < 0 || pitch >= PITCH_COUNT || position < 0 || position >= MAX_PARTITION_LEN) {
        throw new Error('Invalid pitch or position');
    }
    const notePtr = this.beatsGrid[pitch][position];
    return notePtr !== -1 ? this.arenaAllocator.getUnpackedNoteAtArenaIndexOrNull(notePtr) : null;
}
}