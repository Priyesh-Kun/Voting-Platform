// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import type { Voting } from '../target/types/voting';
import { Voting as VotingIDL } from '../target/types/voting';
import idl from "../target/idl/voting.json"

// Re-export the generated IDL and type
export { Voting, VotingIDL };

// The programId is imported from the program IDL.
export const VOTING_PROGRAM_ID = new PublicKey(idl.address);

// This is a helper function to get the Basic Anchor program.
export function getVotingProgram(provider: AnchorProvider) {
  return new Program(idl as Voting, provider);
}
