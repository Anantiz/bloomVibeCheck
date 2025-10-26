import { Asset } from 'expo-asset';

export async function decodeSampleToPCM(
  asset: any
): Promise<{ pcmData: Float32Array; sampleRate: number } | null> {
  console.log('Decoding sample to PCM (native)...');

  try {
    const assetModule = Asset.fromModule(asset);

    if (!assetModule.downloaded) {
      console.log(`⬇ Downloading asset...`);
      await assetModule.downloadAsync();
    }

    const uri = assetModule.localUri || assetModule.uri;
    console.log(`Reading asset from: ${uri}`);

    // Fetch the file (works for both HTTP and file:// URIs)
    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();

    // Parse WAV header and extract PCM data
    const result = parseWAV(arrayBuffer);
    return result;

  } catch (error) {
    console.error('Failed to decode PCM on native:', error);
    return null;
  }
}

// Manual WAV parser
function parseWAV(arrayBuffer: ArrayBuffer): { pcmData: Float32Array; sampleRate: number } | null {
  const view = new DataView(arrayBuffer);

  // Check "RIFF" header
  const riffHeader = String.fromCharCode(
    view.getUint8(0),
    view.getUint8(1),
    view.getUint8(2),
    view.getUint8(3)
  );

  if (riffHeader !== 'RIFF') {
    console.error('Not a valid WAV file - missing RIFF header');
    return null;
  }

  // Check "WAVE" format
  const waveFormat = String.fromCharCode(
    view.getUint8(8),
    view.getUint8(9),
    view.getUint8(10),
    view.getUint8(11)
  );

  if (waveFormat !== 'WAVE') {
    console.error('Not a WAVE format');
    return null;
  }

  // Find "fmt " and "data" chunks
  let offset = 12;
  let sampleRate = 44100;
  let bitsPerSample = 16;
  let numChannels = 1;
  let pcmData: Float32Array | null = null;

  while (offset < view.byteLength - 8) {
    const chunkId = String.fromCharCode(
      view.getUint8(offset),
      view.getUint8(offset + 1),
      view.getUint8(offset + 2),
      view.getUint8(offset + 3)
    );
    const chunkSize = view.getUint32(offset + 4, true);

    if (chunkId === 'fmt ') {
      // Parse format chunk
      // const audioFormat = view.getUint16(offset + 8, true); // 1 = PCM
      numChannels = view.getUint16(offset + 10, true);
      sampleRate = view.getUint32(offset + 12, true);
      // const byteRate = view.getUint32(offset + 16, true);
      // const blockAlign = view.getUint16(offset + 20, true);
      bitsPerSample = view.getUint16(offset + 22, true);

      console.log(`WAV Format - Sample Rate: ${sampleRate}, Bits: ${bitsPerSample}, Channels: ${numChannels}`);

    } else if (chunkId === 'data') {
      // Found data chunk - extract PCM
      const dataOffset = offset + 8;
      const dataSize = chunkSize;

      console.log(`Found data chunk at offset ${dataOffset}, size: ${dataSize} bytes`);

      // Calculate number of samples
      const bytesPerSample = bitsPerSample / 8;
      const totalSamples = dataSize / bytesPerSample / numChannels;
      pcmData = new Float32Array(totalSamples);

      // Convert to Float32Array (normalized -1 to 1)
      if (bitsPerSample === 16) {
        for (let i = 0; i < totalSamples; i++) {
          const sampleOffset = dataOffset + (i * numChannels * bytesPerSample);
          const sample = view.getInt16(sampleOffset, true);
          pcmData[i] = sample / 32768.0; // Normalize to -1 to 1
        }
      } else if (bitsPerSample === 8) {
        for (let i = 0; i < totalSamples; i++) {
          const sampleOffset = dataOffset + (i * numChannels * bytesPerSample);
          const sample = view.getUint8(sampleOffset);
          pcmData[i] = (sample - 128) / 128.0;
        }
      } else if (bitsPerSample === 24) {
        for (let i = 0; i < totalSamples; i++) {
          const sampleOffset = dataOffset + (i * numChannels * bytesPerSample);
          // Read 24-bit as 3 bytes (little-endian)
          const byte1 = view.getUint8(sampleOffset);
          const byte2 = view.getUint8(sampleOffset + 1);
          const byte3 = view.getUint8(sampleOffset + 2);

          // Combine into 24-bit signed integer
          let sample = (byte3 << 16) | (byte2 << 8) | byte1;
          // Convert to signed
          if (sample & 0x800000) {
            sample |= ~0xFFFFFF;
          }
          pcmData[i] = sample / 8388608.0; // Normalize to -1 to 1
        }
      } else if (bitsPerSample === 32) {
        for (let i = 0; i < totalSamples; i++) {
          const sampleOffset = dataOffset + (i * numChannels * bytesPerSample);
          const sample = view.getInt32(sampleOffset, true);
          pcmData[i] = sample / 2147483648.0;
        }
      } else {
        console.error(`Unsupported bit depth: ${bitsPerSample}`);
        return null;
      }

      console.log(`Decoded ${totalSamples} samples`);
      break; // Found data, no need to continue
    }

    // Move to next chunk
    offset += 8 + chunkSize;
    // Chunks are word-aligned (even byte count)
    if (chunkSize % 2 !== 0) {
      offset += 1;
    }
  }

  if (!pcmData) {
    console.error('No data chunk found in WAV file');
    return null;
  }

  return { pcmData, sampleRate };
}