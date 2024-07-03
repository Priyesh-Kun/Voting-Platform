use anchor_lang::prelude::*;

declare_id!("FiaeGx5WqdiaZKjfVVhHsvaTNGcSEqv4ZYFt7yNELv6P");

#[program]
pub mod basic {
    use super::*;

    pub fn greet(_ctx: Context<Initialize>) -> Result<()> {
        msg!("GM!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
