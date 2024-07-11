// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import type { Basic } from '../target/types/basic';
import { Basic as BasicIDL } from '../target/types/basic';
import idl from "../target/idl/basic.json"

// Re-export the generated IDL and type
export { Basic, BasicIDL };

// The programId is imported from the program IDL.
export const BASIC_PROGRAM_ID = new PublicKey(idl.address);

// This is a helper function to get the Basic Anchor program.
export function getBasicProgram(provider: AnchorProvider) {
  return new Program(idl as Basic, provider);
}
