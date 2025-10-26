import { InstrumentType } from "../../types/core";

export function playSound(instrument: InstrumentType, pitch: number) {
  console.log(`Playing sound: ${instrument}, ${pitch}`);
}
