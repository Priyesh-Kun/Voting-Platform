use anchor_lang::prelude::*;

#[account]
pub struct Poll{
    pub publisher: Pubkey,
    pub poll_id: u32,
    pub statement: String,
    pub choices: Vec<Choice>,
    pub of_type: u8,  //0 for single select and 1 for multiple select
    pub created_at: i64,
    pub ended_at: i64,
    pub is_active: bool,
    pub votes: Vec<Vote>,
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone)]
pub struct Vote{
    pub voter: Pubkey,
    pub choices: Vec<Choice>, //vector because if we need to select multiple options 
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone)]
pub struct Choice{
    pub choice_id: u8,
    pub statement: String,
}

#[account]
pub struct State {
    pub last_poll: u32,
    pub active_polls: u32,
}

pub const MAX_STATEMENT_LENGTH: usize = 100;