// lib/init.ts
import { InstrumentManager } from './audio/instrument_manager';

async function initializeInstrumentManager() {
  const manager = InstrumentManager.getInstance();
  await manager.initialize();
}

// other init code can go here

// CRITICAL: Block NOW so later all assets are loaded and ready for sync calls
export async function initAssets() {
  await initializeInstrumentManager();
}



import { useEffect } from 'react';
