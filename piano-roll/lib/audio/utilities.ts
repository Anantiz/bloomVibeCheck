import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

// Web-specific storage using IndexedDB for larger files
const WEB_DB_NAME = 'AudioCache';
const WEB_STORE_NAME = 'wavFiles';

/**
 * Initialize IndexedDB for web platform
 */
async function initWebDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(WEB_DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(WEB_STORE_NAME)) {
        db.createObjectStore(WEB_STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Save WAV file to IndexedDB (Web)
 */
async function saveWAVToWebDB(wavData: ArrayBuffer): Promise<string> {
  const db = await initWebDB();
  const id = `partition_${Date.now()}`;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([WEB_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(WEB_STORE_NAME);

    const request = store.put({
      id,
      data: wavData,
      timestamp: Date.now(),
    });

    request.onsuccess = () => {
      // Create a blob URL for playback
      const blob = new Blob([wavData], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      resolve(url);
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Save WAV file to file system (Mobile)
 */
async function saveWAVToMobile(wavData: ArrayBuffer): Promise<string> {
  const filename = `partition_${Date.now()}.wav`;
  const fileUri = `${FileSystem.cacheDirectory}${filename}`;

  // Convert ArrayBuffer to base64
  const bytes = new Uint8Array(wavData);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return fileUri;
}

/**
 * Save WAV ArrayBuffer to cache (cross-platform)
 * Returns file URI or Blob URL
 */
export async function saveWAVToFile(wavData: ArrayBuffer): Promise<string> {
  if (Platform.OS === 'web') {
    return saveWAVToWebDB(wavData);
  } else {
    return saveWAVToMobile(wavData);
  }
}

/**
 * Cleanup old WAV files from IndexedDB (Web)
 */
async function cleanupWebDB(): Promise<void> {
  const db = await initWebDB();
  const cleanupInitiatedTime = Date.now();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([WEB_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(WEB_STORE_NAME);
    const request = store.openCursor();

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const record = cursor.value;

        // Delete files created before cleanup was initiated
        if (record.timestamp < cleanupInitiatedTime) {
          cursor.delete();
          console.log(`Deleted cached WAV from IndexedDB: ${record.id}`);
        } else {
          console.log(`Skipping recent file: ${record.id}`);
        }

        cursor.continue();
      } else {
        resolve();
      }
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Cleanup old WAV files from file system (Mobile)
 */
async function cleanupMobile(): Promise<void> {
  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) {
    console.error('Cache directory not available');
    return;
  }

  const cleanupInitiatedTime = Date.now();

  try {
    const files = await FileSystem.readDirectoryAsync(cacheDir);

    for (const file of files) {
      if (file.endsWith('.wav')) {
        const timestampMatch = file.match(/partition_(\d+)\.wav$/);

        if (timestampMatch) {
          const fileTimestamp = parseInt(timestampMatch[1], 10);

          if (fileTimestamp < cleanupInitiatedTime) {
            const fileUri = `${cacheDir}${file}`;
            try {
              await FileSystem.deleteAsync(fileUri);
              console.log(`Deleted cached WAV file: ${fileUri}`);
            } catch (error) {
              console.error(`Failed to delete cached WAV file: ${fileUri}`, error);
            }
          } else {
            console.log(`Skipping recent file: ${file}`);
          }
        } else {
          // console.log(`Skipping file with unexpected name pattern: ${file}`);
        }
      }
    }
  } catch (error) {
    console.error('Failed to read cache directory:', error);
  }
}


//// No libs used below -----------------

/**
 * Delete all cached WAV files created before cleanup initiation (cross-platform)
 */
export async function agressiveCleanupAllCacheWav(): Promise<void> {
  if (Platform.OS === 'web') {
    await cleanupWebDB();
  } else {
    await cleanupMobile();
  }
}
/**
 * Mix multiple PCM buffers together by summing samples
 * Automatically normalizes to prevent clipping
 */
export function mixPCMBuffers(buffers: Float32Array[]): Float32Array {
  if (buffers.length === 0) return new Float32Array(0);
  if (buffers.length === 1) return buffers[0];

  // Find the longest buffer to determine output length
  const maxLength = Math.max(...buffers.map(b => b.length));
  const mixed = new Float32Array(maxLength);

  // Sum all samples
  let maxAmplitude = 0;
  for (let i = 0; i < maxLength; i++) {
    let sum = 0;
    for (const buffer of buffers) {
      if (i < buffer.length) {
        sum += buffer[i];
      }
    }
    mixed[i] = sum;
    maxAmplitude = Math.max(maxAmplitude, Math.abs(sum));
  }

  // Normalize if clipping would occur
  if (maxAmplitude > 1.0) {
    const scale = 1.0 / maxAmplitude;
    for (let i = 0; i < mixed.length; i++) {
      mixed[i] *= scale;
    }
  }

  return mixed;
}

/**
 * Trim PCM buffer to specific duration
 */
export function trimPCMBuffer(
  buffer: Float32Array,
  durationSec: number,
  sampleRate: number
): Float32Array {
  const samplesNeeded = Math.floor(durationSec * sampleRate);
  return buffer.slice(0, Math.min(samplesNeeded, buffer.length));
}

/**
 * Encode Float32Array PCM data as WAV file (ArrayBuffer)
 * Mono, 44.1kHz, 16-bit PCM
 */
export function encodeWAV(samples: Float32Array, sampleRate: number = 44100): ArrayBuffer {
  const numChannels = 1; // Mono
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const bufferSize = 44 + dataSize;

  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);

  // WAV Header (44 bytes)
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, bufferSize - 8, true); // File size - 8
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM data (convert Float32 to Int16)
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i])); // Clamp
    const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    view.setInt16(offset, int16, true);
    offset += 2;
  }

  return buffer;
}
