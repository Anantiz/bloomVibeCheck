// lib/core/Partition.ts
import { NotesArenaAllocator } from './music_note';
import {
    HIGHEST_MIDI_PITCH,
    MAX_PARTITION_LEN,
    InstrumentType,
    MusicNoteObj,
    LOWEST_MIDI_PITCH,
} from '../../../types/core'; // ../../../ For fucking real ?!

export class Partition {

    public furthestBeatIndex: number = 0;
    public creator: string;
    public name: string;
    private beatsGrid: Array<Array<number>>; // 2D Array for light-weight beat grid (pointers to MusicNotes); Could be even more optimized with disgusting manual uint20
    private arenaAllocator: NotesArenaAllocator; // Dynamic Heavy Objects

    constructor(creator: string, name: string) {
        this.creator = creator;
        this.name = name;
        this.beatsGrid = Array.from({ length: HIGHEST_MIDI_PITCH - LOWEST_MIDI_PITCH + 1 }, () => Array(MAX_PARTITION_LEN).fill(-1));
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
        if (pitch < LOWEST_MIDI_PITCH || pitch > HIGHEST_MIDI_PITCH || position < 0 || position >= MAX_PARTITION_LEN) {
            throw new Error('Invalid pitch or position; Pitch:' + pitch + ' Position:' + position);
        }
        // If note exists overwrite it, otherwise add new
        const existingArenaIndex: number = this.beatsGrid[pitch - LOWEST_MIDI_PITCH][position];
        if (existingArenaIndex !== -1) {
            this.arenaAllocator.allocate(
                pitch, position, velocity, instrument, existingArenaIndex
            );
        } else {
            this.beatsGrid[pitch - LOWEST_MIDI_PITCH][position] = this.arenaAllocator.allocate(
                pitch, position, velocity, instrument
            );
        }
        if (position > this.furthestBeatIndex) {
            this.furthestBeatIndex = position; // Don't even reduce when deleted; it's fine
        }
    }

    /**
     * Removes a note from the partition.
     * @param pitch The pitch of the note to remove.
     * @param position The position of the note to remove.
     */
    public removeNoteAt(pitch: number, position: number): void {
        if (pitch < LOWEST_MIDI_PITCH || pitch > HIGHEST_MIDI_PITCH || position < 0 || position >= MAX_PARTITION_LEN) {
            throw new Error('Invalid pitch or position; Pitch:' + pitch + ' Position:' + position);
        }
        const notePtr = this.beatsGrid[pitch - LOWEST_MIDI_PITCH][position];
        if (notePtr !== -1) {
            this.arenaAllocator.free(notePtr);
            this.beatsGrid[pitch - LOWEST_MIDI_PITCH][position] = -1;
        }
    }

    /**
     * If the note exists it returns MusicNoteObj else null
     */
    public getNoteAt(pitch: number, position: number): MusicNoteObj | null {
        if (pitch < LOWEST_MIDI_PITCH || pitch > HIGHEST_MIDI_PITCH || position < 0 || position >= MAX_PARTITION_LEN) {
            console.log(`Getting note at pitch ${pitch}, position ${position}`);
        }
        const notePtr = this.beatsGrid[pitch - LOWEST_MIDI_PITCH][position];
        return notePtr !== -1 ? this.arenaAllocator.getUnpackedNoteAtArenaIndexOrNull(notePtr) : null;
    }

    // returns a List of MusicNoteObj at the given beat index; If the partition is done for that beat index returns Null, the player should stop playback
    public getAllNotesAtBeat(beatIndex: number): MusicNoteObj[] | null {
        if (beatIndex < 0 || beatIndex >= MAX_PARTITION_LEN) {
            throw new Error('Invalid beat index: ' + beatIndex);
        }

        // +1 cuz for some reason the player skips the last beat; Too lazy to figure out why
        // Now it crash wtf
        if (beatIndex > this.furthestBeatIndex) {
            return null;
        }
        const notes: MusicNoteObj[] = [];
        for (let pitch = LOWEST_MIDI_PITCH; pitch <= HIGHEST_MIDI_PITCH; pitch++) {
            const note = this.getNoteAt(pitch, beatIndex);
            if (note) {
                notes.push(note);
            }
        }
        return notes;
    }
}