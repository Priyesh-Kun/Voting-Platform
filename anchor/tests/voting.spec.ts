import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Voting } from '../target/types/voting';
import 'dotenv/config.js';
import { getKeypairFromEnvironment } from '@solana-developers/helpers';
import { stat } from 'fs';
import { VoteAccount } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

describe('voting', () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Voting as Program<Voting>;

  const authority = getKeypairFromEnvironment('SECRET_KEY');
  const last_poll = 8;

  const [state, _state] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('STATE')],
    program.programId
  );

  const [poll, _poll] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from('POLL_ACCOUNT'),
      authority.publicKey.toBytes(),
      Buffer.from(last_poll.toString()),
    ],
    program.programId
  );

  interface Choice {
    choiceId: number;
    statement: string;
  }

  const choices: Choice[] = [
    { choiceId: 0, statement: 'Orange' },
    { choiceId: 1, statement: 'Mango' },
  ];
  
  const voteChoices: Choice[] = [
    { choiceId: 0, statement: 'Orange' },
  ];
  
  // it('Initializing State', async () => {
  //   const tx = await program.methods
  //     .initializeState()
  //     .accounts({
  //       authority: authority.publicKey,
  //       state: state,
  //     })
  //     .signers([authority])
  //     .rpc();
  //   console.log('Your transaction signature', tx);
  // });

  it('Creating Poll', async () => {
    const bigTime = new Date().getTime()
    const time = new BN(bigTime)
    const tx = await program.methods
      .createPoll('Which is better?', choices, 0, time)
      .accounts({
        publisher: authority.publicKey,
        state: state,
        poll: poll,
      })
      .signers([authority])
      .rpc();
    console.log('Your transaction signature', tx);
  });
  
  it('Casting Vote', async () => {
    const tx = await program.methods
      .castVote(voteChoices, last_poll)
      .accounts({
        publisher: authority.publicKey,
        voter: authority.publicKey,
        poll: poll,
      })
      .signers([authority])
      .rpc();
    console.log('Your transaction signature', tx);
  });
  
  it('Ending Poll', async () => {
    const bigTime = new Date().getTime()
    const time = new BN(bigTime)
    const tx = await program.methods
      .endPoll(last_poll, time)
      .accounts({
        publisher: authority.publicKey,
        poll: poll,
      })
      .signers([authority])
      .rpc();
    console.log('Your transaction signature', tx);
    const accountInfo = await program.account.poll.fetchNullable(poll)
    console.log(time)
    console.log(bigTime)
    console.log(accountInfo)
  });
  
  it('Deleting Poll', async () => {
    const tx = await program.methods
      .deletePoll(last_poll)
      .accounts({
        publisher: authority.publicKey,
        poll: poll,
      })
      .signers([authority])
      .rpc();
    console.log('Your transaction signature', tx);
  });

});
