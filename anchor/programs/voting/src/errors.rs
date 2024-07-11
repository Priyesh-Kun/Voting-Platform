use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode{
    #[msg("Voter has already voted")]
    AlreadyVoted,
    #[msg("Max statement length exceeded")]
    LengthExceeded,
    #[msg("The Poll already ended")]
    AlreadyEnded,
}