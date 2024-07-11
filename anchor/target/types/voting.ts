/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/voting.json`.
 */
export type Voting = {
  "address": "VothziLdj4b5jhAqhxyiB8bg6zssrQz121dXL6XXiQg",
  "metadata": {
    "name": "voting",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "castVote",
      "discriminator": [
        20,
        212,
        15,
        189,
        69,
        180,
        69,
        151
      ],
      "accounts": [
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "publisher",
          "relations": [
            "poll"
          ]
        },
        {
          "name": "voter",
          "writable": true,
          "signer": true
        },
        {
          "name": "poll",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  80,
                  79,
                  76,
                  76,
                  95,
                  65,
                  67,
                  67,
                  79,
                  85,
                  78,
                  84
                ]
              },
              {
                "kind": "account",
                "path": "publisher"
              },
              {
                "kind": "arg",
                "path": "pollId"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "choices",
          "type": {
            "vec": {
              "defined": {
                "name": "choice"
              }
            }
          }
        },
        {
          "name": "pollId",
          "type": "u32"
        }
      ]
    },
    {
      "name": "createPoll",
      "discriminator": [
        182,
        171,
        112,
        238,
        6,
        219,
        14,
        110
      ],
      "accounts": [
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "publisher",
          "writable": true,
          "signer": true
        },
        {
          "name": "state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  84,
                  65,
                  84,
                  69
                ]
              }
            ]
          }
        },
        {
          "name": "poll",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  80,
                  79,
                  76,
                  76,
                  95,
                  65,
                  67,
                  67,
                  79,
                  85,
                  78,
                  84
                ]
              },
              {
                "kind": "account",
                "path": "publisher"
              },
              {
                "kind": "account",
                "path": "state.last_poll",
                "account": "state"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "statement",
          "type": "string"
        },
        {
          "name": "choices",
          "type": {
            "vec": {
              "defined": {
                "name": "choice"
              }
            }
          }
        },
        {
          "name": "ofType",
          "type": "u8"
        },
        {
          "name": "time",
          "type": "i64"
        }
      ]
    },
    {
      "name": "deletePoll",
      "discriminator": [
        156,
        80,
        237,
        248,
        65,
        44,
        143,
        152
      ],
      "accounts": [
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "publisher",
          "writable": true,
          "signer": true
        },
        {
          "name": "poll",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  80,
                  79,
                  76,
                  76,
                  95,
                  65,
                  67,
                  67,
                  79,
                  85,
                  78,
                  84
                ]
              },
              {
                "kind": "account",
                "path": "publisher"
              },
              {
                "kind": "arg",
                "path": "pollId"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "pollId",
          "type": "u32"
        }
      ]
    },
    {
      "name": "endPoll",
      "discriminator": [
        203,
        232,
        109,
        145,
        93,
        37,
        203,
        68
      ],
      "accounts": [
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "publisher",
          "writable": true,
          "signer": true
        },
        {
          "name": "poll",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  80,
                  79,
                  76,
                  76,
                  95,
                  65,
                  67,
                  67,
                  79,
                  85,
                  78,
                  84
                ]
              },
              {
                "kind": "account",
                "path": "publisher"
              },
              {
                "kind": "arg",
                "path": "pollId"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "pollId",
          "type": "u32"
        },
        {
          "name": "time",
          "type": "i64"
        }
      ]
    },
    {
      "name": "initializeState",
      "discriminator": [
        190,
        171,
        224,
        219,
        217,
        72,
        199,
        176
      ],
      "accounts": [
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  84,
                  65,
                  84,
                  69
                ]
              }
            ]
          }
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "poll",
      "discriminator": [
        110,
        234,
        167,
        188,
        231,
        136,
        153,
        111
      ]
    },
    {
      "name": "state",
      "discriminator": [
        216,
        146,
        107,
        94,
        104,
        75,
        182,
        177
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "alreadyVoted",
      "msg": "Voter has already voted"
    },
    {
      "code": 6001,
      "name": "lengthExceeded",
      "msg": "Max statement length exceeded"
    },
    {
      "code": 6002,
      "name": "alreadyEnded",
      "msg": "The Poll already ended"
    }
  ],
  "types": [
    {
      "name": "choice",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "choiceId",
            "type": "u8"
          },
          {
            "name": "statement",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "poll",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "publisher",
            "type": "pubkey"
          },
          {
            "name": "pollId",
            "type": "u32"
          },
          {
            "name": "statement",
            "type": "string"
          },
          {
            "name": "choices",
            "type": {
              "vec": {
                "defined": {
                  "name": "choice"
                }
              }
            }
          },
          {
            "name": "ofType",
            "type": "u8"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "endedAt",
            "type": "i64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "votes",
            "type": {
              "vec": {
                "defined": {
                  "name": "vote"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "state",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lastPoll",
            "type": "u32"
          },
          {
            "name": "activePolls",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "vote",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "voter",
            "type": "pubkey"
          },
          {
            "name": "choices",
            "type": {
              "vec": {
                "defined": {
                  "name": "choice"
                }
              }
            }
          }
        ]
      }
    }
  ]
};
