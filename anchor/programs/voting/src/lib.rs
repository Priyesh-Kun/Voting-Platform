use anchor_lang::prelude::*;

pub mod errors;
pub mod states;
use errors::ErrorCode;
use states::*;

declare_id!("VothziLdj4b5jhAqhxyiB8bg6zssrQz121dXL6XXiQg");

pub fn exceeds_max_length(choices: &Vec<Choice>, max: usize) -> bool {
    for choice in choices {
        if choice.statement.len() > max {
            return true;
        }
    }
    return false;
}

#[program]
pub mod voting {
    use super::*;

    pub fn initialize_state(ctx: Context<InitializeState>) -> Result<()> {
        let state_account = &mut ctx.accounts.state;

        state_account.last_poll = 0;
        state_account.active_polls = 0;

        msg!("State Initialized!");
        Ok(())
    }

    pub fn create_poll(
        ctx: Context<CreatePoll>,
        statement: String,
        choices: Vec<Choice>,
        of_type: u8,
        time: i64,
    ) -> Result<()> {
        let poll_account = &mut ctx.accounts.poll;
        let state_account = &mut ctx.accounts.state;

        if statement.len() > MAX_STATEMENT_LENGTH
            || exceeds_max_length(&choices, MAX_STATEMENT_LENGTH)
        {
            return err!(ErrorCode::LengthExceeded);
        } else {
            poll_account.publisher = ctx.accounts.publisher.key();
            poll_account.poll_id = state_account.last_poll;
            poll_account.statement = statement;
            poll_account.choices = choices;
            poll_account.of_type = of_type;
            poll_account.created_at = time;
            poll_account.is_active = true;

            state_account.active_polls += 1;
            state_account.last_poll += 1;

            msg!("Poll Created!");
        }

        Ok(())
    }

    pub fn cast_vote(ctx: Context<CastVote>, choices: Vec<Choice>, _poll_id: u32) -> Result<()> {
        let poll_account = &mut ctx.accounts.poll;

        if let Some(_pos) = poll_account
            .votes
            .iter()
            .position(|vote| vote.voter == ctx.accounts.voter.key())
        {
            return err!(ErrorCode::AlreadyVoted);
        } else {
            poll_account.votes.push(Vote {
                voter: ctx.accounts.voter.key(),
                choices: choices,
            });
            msg!("Vote Added!");
        }

        Ok(())
    }

    pub fn end_poll(ctx: Context<EndPoll>, _poll_id: u32, time: i64) -> Result<()> {
        let poll_account = &mut ctx.accounts.poll;
        if poll_account.is_active {
            poll_account.is_active = false;
            poll_account.ended_at = time;
        } else {
            return err!(ErrorCode::AlreadyEnded);
        }

        msg!("Poll Ended!");
        Ok(())
    }

    pub fn delete_poll(_ctx: Context<DeletePoll>, _poll_id: u32) -> Result<()> {
        msg!("Poll Deleted!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeState<'info> {
    pub system_program: Program<'info, System>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + std::mem::size_of::<State>(),
        seeds = [
            b"STATE"
        ],
        bump
    )]
    pub state: Account<'info, State>,
}

#[derive(Accounts)]
#[instruction(statement:String, choices: Vec<Choice>)]
pub struct CreatePoll<'info> {
    pub system_program: Program<'info, System>,
    #[account(mut)]
    pub publisher: Signer<'info>,
    #[account(
        mut,
        seeds = [
            b"STATE"
        ],
        bump
    )]
    pub state: Account<'info, State>,
    #[account(
        init,
        payer = publisher,
        space = 8 + std::mem::size_of::<Poll>() + (choices.len())*(std::mem::size_of::<Choice>()+4*MAX_STATEMENT_LENGTH) + statement.len() ,
        seeds = [
            b"POLL_ACCOUNT",
            publisher.key().as_ref(),
            state.last_poll.to_string().as_bytes(),
        ],
        bump
    )]
    pub poll: Account<'info, Poll>,
}

#[derive(Accounts)]
#[instruction(choices: Vec<Choice>, poll_id: u32)]
pub struct CastVote<'info> {
    pub system_program: Program<'info, System>,
    /// CHECK:
    pub publisher: AccountInfo<'info>,
    #[account(mut)]
    pub voter: Signer<'info>,
    #[account(
        mut,
        realloc = 8 + std::mem::size_of::<Poll>() + 4*MAX_STATEMENT_LENGTH + (poll.choices.len())*(std::mem::size_of::<Choice>()+4*MAX_STATEMENT_LENGTH) + poll.statement.len() + (poll.votes.len())*(std::mem::size_of::<Vote>() + (poll.choices.len())*(std::mem::size_of::<Choice>()+4*MAX_STATEMENT_LENGTH)),
        realloc::payer = voter,
        realloc::zero = false,
        seeds = [
            b"POLL_ACCOUNT",
            publisher.key().as_ref(),
            poll_id.to_string().as_bytes(),
        ],
        bump,
        has_one = publisher
    )]
    pub poll: Account<'info, Poll>,
}

#[derive(Accounts)]
#[instruction(poll_id:u32)]
pub struct DeletePoll<'info> {
    pub system_program: Program<'info, System>,
    #[account(mut)]
    pub publisher: Signer<'info>,
    #[account(
        mut,
        seeds = [
            b"POLL_ACCOUNT",
            publisher.key().as_ref(),
            poll_id.to_string().as_bytes(),
        ],
        bump,
        close = publisher,
    )]
    pub poll: Account<'info, Poll>,
}

#[derive(Accounts)]
#[instruction(poll_id:u32)]
pub struct EndPoll<'info> {
    pub system_program: Program<'info, System>,
    #[account(mut)]
    pub publisher: Signer<'info>,
    #[account(
        mut,
        seeds = [
            b"POLL_ACCOUNT",
            publisher.key().as_ref(),
            poll_id.to_string().as_bytes(),
        ],
        bump,
    )]
    pub poll: Account<'info, Poll>,
}
