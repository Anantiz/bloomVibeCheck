import { Asset } from 'expo-asset';

export async function decodeSampleToPCM(
  asset: any
): Promise<{ pcmData: Float32Array; sampleRate: number } | null> {
    console.log('Decoding sample to PCM (web)...');
    try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();

    const assetModule = Asset.fromModule(asset);
    await assetModule.downloadAsync();
    const uri = assetModule.uri;

    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const pcmData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;

    await audioContext.close();

    return { pcmData, sampleRate };
  } catch (error) {
    console.error('Failed to decode PCM:', error);
    return null;
  }
}