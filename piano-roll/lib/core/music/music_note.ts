import { ARENA_ALLOCATOR_SIZE, InstrumentType, MusicNoteObj } from "../../../types/core";

// Gotta max out those L-2 cache hits

export class BinaryMusicNote {
    public static readonly PITCH_OFFSET = 0;
    public static readonly BEAT_INDEX_OFFSET = 1;
    public static readonly VELOCITY_OFFSET = 3;
    public static readonly INSTRUMENT_OFFSET = 4;
    public static readonly SIZE = 5;

    static unpack(buffer: Uint8Array, offset: number): {
        pitch: number;
        beatIndex: number;
        velocity: number;
        instrument: InstrumentType;
    } {
        return {
            pitch: buffer[offset],
            // Manual little-endian 16-bit read
            beatIndex: buffer[offset + 1] | (buffer[offset + 2] << 8),
            velocity: buffer[offset + 3],
            instrument: buffer[offset + 4] as InstrumentType
        };
    }

    static setPitch(buffer: Uint8Array, offset: number, pitch: number): void {
        buffer[offset + this.PITCH_OFFSET] = pitch;  // Direct write, no allocations!
    }

    static setBeatIndex(buffer: Uint8Array, offset: number, beatIndex: number): void {
        buffer[offset + 1] = beatIndex & 0xFF;
        buffer[offset + 2] = (beatIndex >> 8) & 0xFF;
    }

    static setVelocity(buffer: Uint8Array, offset: number, velocity: number): void {
        buffer[offset + this.VELOCITY_OFFSET] = velocity;
    }

    static setInstrument(buffer: Uint8Array, offset: number, instrument: InstrumentType): void {
        buffer[offset + this.INSTRUMENT_OFFSET] = instrument;
    }

    static getPitch(buffer: Uint8Array, offset: number): number {
        return buffer[offset + this.PITCH_OFFSET];
    }

    static getBeatIndex(buffer: Uint8Array, offset: number): number {
        return buffer[offset + 1] | (buffer[offset + 2] << 8);
    }

    static getVelocity(buffer: Uint8Array, offset: number): number {
        return buffer[offset + this.VELOCITY_OFFSET];
    }

    static getInstrument(buffer: Uint8Array, offset: number): InstrumentType {
        return buffer[offset + this.INSTRUMENT_OFFSET] as InstrumentType;
    }
}

/**
 * Zero-allocation arena with maximum performance
 */
export class NotesArenaAllocator {
    private buffer: Uint8Array;          // Direct Uint8Array instead of ArrayBuffer
    private freeStack: Uint32Array;      // Typed array for better performance
    private freeStackTop: number = 0;
    private readonly capacity: number;
    private usedCount: number = 0;

    constructor(capacity: number = ARENA_ALLOCATOR_SIZE) {
        this.capacity = capacity;
        this.buffer = new Uint8Array(capacity * BinaryMusicNote.SIZE);
        this.freeStack = new Uint32Array(capacity);

        // Initialize free stack in reverse order for better cache locality
        for (let i = 0; i < capacity; i++) {
            this.freeStack[i] = capacity - 1 - i;
        }
        this.freeStackTop = capacity;
    }

    allocate(
        pitch: number,
        beatIndex: number,
        velocity: number,
        instrument: InstrumentType,
        arenaIndex: number = -1
    ): number {
        if (this.freeStackTop === 0) {
            // TODO: Make this a linked list of arenas for unlimited notes;
            throw new Error("Arena out of memory");
            // return this.next.allocate(pitch, beatIndex, velocity, instrument) + this.capacity;
        }
        if (! (arenaIndex >= 0 && arenaIndex < this.capacity)) {
            arenaIndex = this.freeStack[--this.freeStackTop];
        }
        let byteOffset = arenaIndex * BinaryMusicNote.SIZE;

        // Direct memory writes - fastest possible
        this.buffer[byteOffset] = pitch;
        this.buffer[byteOffset + 1] = beatIndex & 0xFF;
        this.buffer[byteOffset + 2] = (beatIndex >> 8) & 0xFF;
        this.buffer[byteOffset + 3] = velocity;
        this.buffer[byteOffset + 4] = instrument;

        this.usedCount++;
        return arenaIndex;
    }

    free(arenaIndex: number): void {
        if (arenaIndex < 0 || arenaIndex >= this.capacity) {
            throw new Error("Invalid arena index");
        }
        this.freeStack[this.freeStackTop++] = arenaIndex;
        this.usedCount--;
    }

    getUnpackedNoteAtArenaIndexOrNull(arenaIndex: number): MusicNoteObj | null {
        if (arenaIndex < 0 || arenaIndex >= this.capacity) {
            return null;
        }
        if (this.isSlotUsed(arenaIndex)) {
            const offset = arenaIndex * BinaryMusicNote.SIZE;
            return BinaryMusicNote.unpack(this.buffer, offset);
        }
        return null;
    }

    /**
     * @brief : Alias for allocate to keep get/set API consistent
     */
    setNoteAtArenaIndex(arenaIndex: number, pitch: number, beatIndex: number, velocity: number, instrument: InstrumentType): number {
        return this.allocate(pitch, beatIndex, velocity, instrument, arenaIndex);
    }

    private isSlotUsed(arenaIndex: number): boolean {
        // Check if arenaIndex is NOT in the free stack
        for (let i = 0; i < this.freeStackTop; i++) {
            if (this.freeStack[i] === arenaIndex) return false;
        }
        return true;
    }
}