// lib/audio/sound_engine.ts
import { InstrumentType, PLAYBACK_BPM } from "../../types/core";
import { Partition } from "../core/music/partition";
import { InstrumentManager } from "./instrument_manager";
import type { AudioPlayer as AudioPlayerType } from 'expo-audio';
import { createAudioPlayer } from 'expo-audio';
import { agressiveCleanupAllCacheWav } from './utilities';



export class PartitionPlaybackController {
  private isCancelled = false;
  private currentPlayer: AudioPlayerType | null = null;
  private playbackPromise: Promise<{ player: any; duration: number }> | null = null;

  /**
   * @param partition The partition to play
   * @param bpm At which it will be read/played
   * @returns The audio players that makes actual noise-irl and the duration of the playback
   * @note The Creation of the AudioPlayer is Awaited inside.
   *       HoweverThe AudioPlayer.play() (noisy thing) is started but not awaited (expected workflow)
   *       And We return the AudioPlayer instance to the caller if they want to manually stop/pause it later.
   *       I don't get the point tho because the controller already has a .cancel() method that does that. ¯\_(ツ)_/¯
   */
  private async startPlayback(partition: Partition, bpm: number): Promise<{ player: any; duration: number }> {
    if (this.isCancelled) {
      throw new Error('Playback cancelled');
    }

    const manager = InstrumentManager.getInstance();
    if (!manager['isInitialized']) {
      throw new Error('InstrumentManager not initialized. Call initialize() first.');
    }

    console.log('Rendering partition to audio file...');
    const { uri, duration } = await manager.renderPartition(partition, bpm);

    if (this.isCancelled) {
      throw new Error('Playback cancelled');
    }

    console.log(`Partition rendered: ${uri} (${duration.toFixed(2)}s)`);

    // Create player and start playback

    const player: AudioPlayerType = createAudioPlayer(uri);
    this.currentPlayer = player;
    player.volume = 1.0; // Ensure volume is set
    player.play();

    (async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await agressiveCleanupAllCacheWav(); // Free up memory immediately
    })(); // Setup a thing to destroy the cached waves to not leak memory; On paper it would work
    // I wrote my first JS anonymous monstruosity all by myself *proudly*

    return { player, duration };
  }

  cancel() {
    this.isCancelled = true;
    if (this.currentPlayer) {
      this.currentPlayer.pause();
      this.currentPlayer = null;
    }
  }

  // ~~Get the playback promise for tracking~~ make it private, seems safer
  private getPlaybackPromise(): Promise<{ player: any; duration: number }> | null {
    return this.playbackPromise;
  }

  // Start playback and return the promise (doesn't await it)
  startPlaybackDetached(partition: Partition, bpm: number): Promise<{ player: any; duration: number }> {
    this.isCancelled = false;
    this.playbackPromise = this.startPlayback(partition, bpm);
    return this.playbackPromise;
  }

  // Well; TypeScript doesn't have destructors; How the Fck am I going to cleanup that tmp audio file?
}


// MUST BE SYNC
export function playSingleNote(instrument: InstrumentType, pitch: number) {
  console.log(`Playing sound: ${instrument}, ${pitch}`);
  const manager = InstrumentManager.getInstance();

  // So Outrageous news: In JS you can just... Not await coroutines ... and it's not an error...
  // There is no  "const my_coroutine_reference = asyncio.create_task()" pattern ... cuz it's the DEFAULT BEHAVIOR
  // Welcome Silent Errors
  // Also: U can't .cancel() them either.
  // I don't even have enough hate-energy left to be mad about it.

  // Thus -> COMPLETLY FUCKING VALID AND NORMAL CODE: (it hurts)
  manager.playNote(instrument, pitch).catch(error => {
    console.error('Error playing note:', error);
  });

  // And I don't have 15min to waste integrating this with the useMusicStore.playing:bool state
  // So u will just have to deal with stacking-up 10s piano notes if u spam click the keys
  // No damper pedal *screams in russian pianist voice*
}


/**
 *
 * @param partition The partition to play
 * @returns A PlaybackController to manage playback. Automatically start but you still need to manage its lifecycle. After termination (set it to null)
 */
export function startPartitionPlayback(partition: Partition): PartitionPlaybackController {
  console.log(`Starting playback for partition: ${partition}`);
  const controller = new PartitionPlaybackController();

  // Start playback async but don't await - let it run in background
  const unused_lmfao = controller.startPlaybackDetached(partition, PLAYBACK_BPM)
    .then(result => {
      console.log('Playback completed successfully', result);
    })
    .catch(error => {
      if (error.message !== 'Playback cancelled') {
        console.error('Playback failed:', error);
      }
    });
  // We return the controler (nice .cancel()) instead of the AudioPlayer (rertarded .pause())
  return controller;
}

// Stops playback given a controller
export function stopPartitionPlayback(controller: PartitionPlaybackController | null) {
  console.log(`Stopping playback`);
  if (controller) {
    controller.cancel(); // Here we cancel the controler
  }
}