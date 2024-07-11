'use client';

import * as voting from './voting-data-access';
import { useEffect, useState, ChangeEvent } from 'react';
import { BN } from '@coral-xyz/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ellipsify } from '../ui/ui-layout';

export interface PollDetails {
  statement: string;
  ofType: number;
  choices: voting.Choice[];
}

export function VotingCreatePoll() {
  const { createPoll, getState, state, programId, getPolls, initializeState } =
    voting.useVotingProgram();
  const [pollDetails, setPollDetails] = useState<PollDetails>({
    statement: '',
    ofType: 0,
    choices: [],
  });
  const { publicKey } = useWallet();

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index?: number
  ) => {
    const { name, value } = e.target;

    if (name === 'statement') {
      setPollDetails((prevDetails) => ({
        ...prevDetails,
        [name]: value,
      }));
    } else if (name === 'choice' && index !== undefined) {
      const newChoices = [...pollDetails.choices];
      newChoices[index].statement = value;
      newChoices[index].choiceId = index;
      setPollDetails((prevDetails) => ({
        ...prevDetails,
        choices: newChoices,
      }));
    } else if (name === 'ofType') {
      setPollDetails((prevDetails) => ({
        ...prevDetails,
        [name]: Number(value),
      }));
    }
  };

  const handleAddChoice = () => {
    setPollDetails((prevDetails) => ({
      ...prevDetails,
      choices: [...prevDetails.choices, { choiceId: 100, statement: '' }],
    }));
  };

  const handleRemoveChoice = (index: number) => {
    setPollDetails((prevDetails) => ({
      ...prevDetails,
      choices: prevDetails.choices.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let bigTime = new Date().getTime();
    let time: BN = new BN(bigTime);
    if (publicKey) {
      if (getState.data) {
        let [poll, _poll] = PublicKey.findProgramAddressSync(
          [
            Buffer.from('POLL_ACCOUNT'),
            publicKey.toBytes(),
            Buffer.from(getState.data?.lastPoll.toString()),
          ],
          programId
        );
        let submit: voting.CreatePoll = {
          statement: pollDetails.statement,
          choices: pollDetails.choices,
          ofType: pollDetails.ofType,
          time,
          accounts: {
            publisher: publicKey,
            state,
            poll,
          },
        };
        createPoll.mutateAsync(submit);
      } else {
        initializeState.mutateAsync({
          accounts: {
            authority: publicKey,
            state,
          },
        });
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-6 bg-teal-300 rounded-lg shadow-md"
    >
      <div>
        <label className="block text-xs font-medium text-gray-700 text-left">
          Poll Statement
        </label>
        <input
          type="text"
          name="statement"
          value={pollDetails.statement}
          onChange={handleInputChange}
          className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-500 px-4 py-2 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mt-1  xl:text-xl p-2 text-gray-700"
          required
        />
      </div>
      <div>
        <label className="block text-xs text-left font-medium text-gray-700">
          Poll Type
        </label>
        <select
          name="ofType"
          value={pollDetails.ofType}
          onChange={handleInputChange}
          className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-500 px-4 py-2 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-2 f mt-1 focus:ring-indigo-500 focus:border-indigo-500 xl:text-xl p-2 text-gray-700"
          required
        >
          <option value={0}>Single Choice</option>
          <option value={1}>Multiple Choice</option>
        </select>
      </div>
      <div>
        <label className="block text-md font-medium text-gray-700">
          Choices
        </label>
        {pollDetails.choices.map((choice, index) => (
          <div key={index} className="flex items-center mt-3">
            <input
              type="text"
              name="choice"
              value={choice.statement}
              onChange={(e) => handleInputChange(e, index)}
              className="flex-1 block appearance-none w-full bg-white border border-gray-300 hover:border-gray-500 px-4 py-2 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500  xl:text-xl p-2 text-gray-700"
              required
            />
            {pollDetails.choices.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveChoice(index)}
                className="bg-red-500 text-white py-2 px-4 rounded-md disabled:bg-gray-400 ml-2"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddChoice}
          className="mt-2 text-gray-600 hover:text-gray-700"
        >
          Add More Choices
        </button>
      </div>
      <div>
        <button
          type="submit"
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50"
          disabled={createPoll.isPending}
        >
          Submit Poll{createPoll.isPending && '...'}
        </button>
      </div>
    </form>
  );
}

interface Poll {
  publisher: PublicKey;
  pollId: number;
  statement: string;
  choices: voting.Choice[];
  ofType: number;
  createdAt: BN;
  endedAt: BN;
  isActive: boolean;
  votes: Vote[];
}

interface Vote {
  voter: PublicKey;
  choices: voting.Choice[];
}

export function VotingPolls() {
  const { publicKey } = useWallet();
  const { getPolls, castVote, programId, endPoll, deletePoll } =
    voting.useVotingProgram();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [selectedChoices, setSelectedChoices] = useState<{
    [key: number]: number[];
  }>({});
  const [votable, setVotable] = useState<{ [key: number]: boolean }>();
  const [choicesBar, setChoicesBar] = useState<{
    [key: number]: { choiceId: number; statement: string; votes: number }[];
  }>();
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const result = await getPolls.refetch();
        if (result.status == 'success') {
          const polls = result.data.map((poll) => poll.account);
          if (publicKey) {
            setVotable((prev) => {
              let prevS = prev;
              for (let i = 0; i < polls.length; i++) {
                prevS = {
                  ...prevS,
                  [polls[i].pollId]: !polls[i].votes
                    .map((vote: Vote) => vote.voter.toBase58())
                    .includes(publicKey?.toBase58()),
                };
              }
              return prevS;
            });
          }
          setPolls(polls);
          const choicesBar = polls.map((poll) => {
            const count = poll.choices.map((choice: voting.Choice) => {
              const voteCount = poll.votes.reduce((acc, vote) => {
                if (
                  vote.choices.filter(
                    (choice2: voting.Choice) =>
                      choice2.choiceId == choice.choiceId
                  ).length >= 1
                ) {
                  return acc + 1;
                } else {
                  return acc;
                }
              }, 0);
              return {
                choiceId: choice.choiceId,
                statement: choice.statement,
                votes: voteCount,
              };
            });
            return { pollId: poll.pollId, votes: count };
          });
          setChoicesBar((prev) => {
            let prevS = prev;
            for (let i = 0; i < choicesBar.length; i++) {
              prevS = {
                ...prevS,
                [choicesBar[i].pollId]: choicesBar[i].votes,
              };
            }
            return prevS;
          });
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchPolls();
  }, [getPolls.refetch]);

  const handleCheckboxChange = (pollId: number, choiceId: number) => {
    const poll = polls.filter((_) => _.pollId == pollId)[0];
    if (poll.ofType == 1) {
      setSelectedChoices((prevSelectedChoices) => {
        const pollChoices = prevSelectedChoices[pollId] || [];
        if (pollChoices.includes(choiceId)) {
          return {
            ...prevSelectedChoices,
            [pollId]: pollChoices.filter((id) => id !== choiceId),
          };
        } else {
          return {
            ...prevSelectedChoices,
            [pollId]: [...pollChoices, choiceId],
          };
        }
      });
    } else {
      setSelectedChoices((prevSelectedChoices) => {
        const pollChoices = prevSelectedChoices[pollId] || [];
        if (pollChoices.includes(choiceId)) {
          return {
            ...prevSelectedChoices,
            [pollId]: pollChoices.filter((id) => id !== choiceId),
          };
        } else {
          return {
            ...prevSelectedChoices,
            [pollId]: [choiceId],
          };
        }
      });
    }
  };

  const handleVote = (pollId: number) => {
    const choicesToVote = selectedChoices[pollId] || [];
    const poll = polls.filter((_) => _.pollId == pollId);
    const choices = poll[0].choices.filter((choice) =>
      choicesToVote.includes(choice.choiceId)
    );
    const voters = poll[0].votes.map((vote) => vote.voter.toBase58());
    if (publicKey && !voters.includes(publicKey.toBase58())) {
      const vote: Vote = {
        voter: publicKey,
        choices,
      };
      setPolls((prevPolls) =>
        prevPolls.map((poll) => {
          const votes = poll.votes;
          if (poll.pollId === pollId) {
            return {
              ...poll,
              votes: [...votes, vote],
            };
          } else {
            return poll;
          }
        })
      );
      const [pollPub] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('POLL_ACCOUNT'),
          poll[0].publisher.toBytes(),
          Buffer.from(pollId.toString()),
        ],
        programId
      );
      const submit: voting.CastVote = {
        choices,
        pollId,
        accounts: {
          publisher: poll[0].publisher,
          voter: publicKey,
          poll: pollPub,
        },
      };
      castVote.mutateAsync(submit);
    }
  };

  const handleDelete = (pollId: number) => {
    let submit: voting.DeletePoll;
    if (publicKey) {
      const poll = polls.filter((_) => _.pollId == pollId);
      const [pollPub] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('POLL_ACCOUNT'),
          poll[0].publisher.toBytes(),
          Buffer.from(pollId.toString()),
        ],
        programId
      );
      submit = {
        pollId,
        accounts: {
          publisher: publicKey,
          poll: pollPub,
        },
      };
      deletePoll.mutateAsync(submit);
    }
  };
  const handleEnd = (pollId: number) => {
    let submit: voting.EndPoll;
    if (publicKey) {
      let bigTime = new Date().getTime();
      let time: BN = new BN(bigTime);
      const poll = polls.filter((_) => _.pollId == pollId);
      const [pollPub] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('POLL_ACCOUNT'),
          poll[0].publisher.toBytes(),
          Buffer.from(pollId.toString()),
        ],
        programId
      );
      submit = {
        pollId,
        time,
        accounts: {
          publisher: publicKey,
          poll: pollPub,
        },
      };
      endPoll.mutateAsync(submit);
    }
  };

  return (
    <div className="p-4 text-center grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-flow-row gap-9 w-full mb-10">
      {polls.map((poll) => (
        <div
          key={poll.pollId}
          className="poll hover:shadow-cyan-300/50 shadow-cyan-500/50	p-6 rounded-lg shadow-md flex flex-col border-solid border	border-cyan-100"
        >
          <h3 className="text-3xl font-bold mb-2">{poll.statement}</h3>
          <p className=" text-left text-xs">
            Publisher: {ellipsify(poll.publisher.toBase58())}
          </p>

          {poll.isActive ? (
            <p className="text-xs mb-4 text-left">
              Created at: {new Date(poll.createdAt.toNumber()).toLocaleString()}
            </p>
          ) : (
            <p className="text-xs mb-4 text-left">
              Ended at: {new Date(poll.endedAt.toNumber()).toLocaleString()}
            </p>
          )}
          <div className="flex-grow">
            {poll.choices.map((choice) => (
              <div key={choice.choiceId} className="flex items-center mb-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(selectedChoices[poll.pollId] || []).includes(
                      choice.choiceId
                    )}
                    onChange={() =>
                      handleCheckboxChange(poll.pollId, choice.choiceId)
                    }
                    disabled={
                      !poll.isActive || (votable && !votable[poll.pollId])
                    }
                    className="form-checkbox text-indigo-600"
                  />
                  <span className="">{choice.statement}</span>
                </label>
              </div>
            ))}
            <button
              onClick={() => handleVote(poll.pollId)}
              disabled={
                !poll.isActive ||
                (votable && !votable[poll.pollId]) ||
                castVote.isPending
              }
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md disabled:bg-gray-400"
            >
              Vote
            </button>
            <div className="mt-6">
              <h4 className="text-xl font-semibold mb-4">Results</h4>
              <div className="w-full h-64">
                <ResponsiveContainer>
                  <BarChart data={choicesBar && choicesBar[poll.pollId]}>
                    <XAxis dataKey="statement" />
                    <Tooltip />
                    <Bar dataKey="votes" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="mt-6 flex space-x-4">
            <button
              onClick={() => handleEnd(poll.pollId)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md disabled:bg-gray-400"
              disabled={
                !poll.isActive ||
                !(publicKey?.toBase58() == poll.publisher.toBase58())
              }
            >
              End Poll
            </button>
            <button
              onClick={() => handleDelete(poll.pollId)}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md disabled:bg-gray-400"
              disabled={!(publicKey?.toBase58() == poll.publisher.toBase58())}
            >
              Delete Poll
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
