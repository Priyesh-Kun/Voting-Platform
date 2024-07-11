'use client';

import { VOTING_PROGRAM_ID as programId, getVotingProgram } from '@dvp/anchor';
import { Program } from '@coral-xyz/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Keypair, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';
import { BN } from '@coral-xyz/anchor';

export interface InitializeState {
  accounts: {
    authority: PublicKey,
    state: PublicKey,
  }
}

export interface Choice {
  choiceId: number,
  statement: string,
}

export interface CreatePoll {
  statement: string,
  choices: Choice[],
  ofType: number,
  time: BN,
  accounts: {
    publisher: PublicKey,
    state: PublicKey,
    poll: PublicKey,
  }
}

export interface CastVote {
  choices: Choice[],
  pollId: number,
  accounts:{
    publisher: PublicKey,
    voter: PublicKey,
    poll: PublicKey,
  }
}

export interface EndPoll{
  pollId: number, 
  time: BN,
  accounts:{
    publisher: PublicKey,
    poll: PublicKey,
  }
}

export interface DeletePoll {
  pollId: number,
  accounts: {
    publisher: PublicKey,
    poll: PublicKey,
  }
}

export function useVotingProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const program = getVotingProgram(provider);

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const getPolls = useQuery({
    queryKey: ['get-polls', { cluster }],
    queryFn: () => program.account.poll.all(),
  });

  const [state, _state] = PublicKey.findProgramAddressSync(
    [Buffer.from('STATE')],
    program.programId
  );

  const getState = useQuery({
    queryKey: ['get-state', { cluster }],
    queryFn: () => program.account.state.fetch(state),
  });

  const initializeState = useMutation({
    mutationKey: ['voting', 'initializeState', { cluster }],
    mutationFn: (data: InitializeState) => program.methods.initializeState().accounts(data.accounts).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: () => toast.error('Failed to run program'),
  });
  
  const createPoll = useMutation({
    mutationKey: ['voting', 'createPoll', { cluster }],
    mutationFn: (data: CreatePoll) => program.methods.createPoll(data.statement, data.choices, data.ofType, data.time).accounts(data.accounts).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: () => toast.error('Failed to run program'),
  });
  
  const castVote = useMutation({
    mutationKey: ['voting', 'castVote', { cluster }],
    mutationFn: (data: CastVote) => program.methods.castVote(data.choices, data.pollId).accounts(data.accounts).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: () => toast.error('Failed to run program'),
  });
  
  const endPoll = useMutation({
    mutationKey: ['voting', 'endPoll', { cluster }],
    mutationFn: (data: EndPoll) => program.methods.endPoll(data.pollId, data.time).accounts(data.accounts).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: () => toast.error('Failed to run program'),
  });
  
  const deletePoll = useMutation({
    mutationKey: ['voting', 'deletePoll', { cluster }],
    mutationFn: (data: DeletePoll) => program.methods.deletePoll(data.pollId).accounts(data.accounts).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: () => toast.error('Failed to run program'),
  });
  
  return {
    program,
    programId,
    getProgramAccount,
    getPolls,
    getState,
    initializeState,
    createPoll,
    castVote,
    endPoll,
    deletePoll,
    state,
  }
}
