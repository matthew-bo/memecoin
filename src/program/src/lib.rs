use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use solana_program::{
    program::{invoke, invoke_signed},
    system_instruction,
};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"); // Replace with your program ID after deployment

#[program]
pub mod memecoin_vote {
    use super::*;

    // Initialize the memecoin token
    pub fn initialize_token(
        ctx: Context<InitializeToken>,
        name: String,
        symbol: String,
        uri: String,
        decimals: u8,
        total_supply: u64,
    ) -> Result<()> {
        let token_mint = &mut ctx.accounts.token_mint;
        let token_authority = &ctx.accounts.authority;
        
        // Store token metadata
        let token_metadata = &mut ctx.accounts.token_metadata;
        token_metadata.name = name;
        token_metadata.symbol = symbol;
        token_metadata.uri = uri;
        token_metadata.authority = token_authority.key();
        token_metadata.decimals = decimals;
        token_metadata.total_supply = total_supply;
        token_metadata.transaction_fee_bp = 300; // 3% transaction fee (300 basis points)
        token_metadata.development_allocation = 10; // 10% of total supply
        token_metadata.marketing_allocation = 15; // 15% of total supply
        token_metadata.team_allocation = 10; // 10% of total supply
        token_metadata.community_allocation = 15; // 15% of total supply
        token_metadata.liquidity_allocation = 50; // 50% of total supply

        // Initialize the poll system
        let poll_system = &mut ctx.accounts.poll_system;
        poll_system.authority = token_authority.key();
        poll_system.best_poll_current_id = 0;
        poll_system.worst_poll_current_id = 0;
        poll_system.poll_duration = 86400; // 1 day in seconds
        
        msg!("Memecoin token initialized successfully");
        Ok(())
    }

    // Create a new poll for "best person"
    pub fn create_best_poll(
        ctx: Context<CreatePoll>,
        start_time: i64,
    ) -> Result<()> {
        let poll_system = &mut ctx.accounts.poll_system;
        let poll_account = &mut ctx.accounts.poll_account;
        
        // Verify creator is the authority
        require!(
            poll_system.authority == ctx.accounts.authority.key(),
            MememcoinVoteError::UnauthorizedPollCreation
        );
        
        // Set up new poll
        poll_account.poll_id = poll_system.best_poll_current_id;
        poll_account.poll_type = PollType::Best;
        poll_account.start_time = start_time;
        poll_account.end_time = start_time + poll_system.poll_duration;
        poll_account.is_active = true;
        poll_account.total_votes = 0;
        
        // Increment poll ID for next poll
        poll_system.best_poll_current_id += 1;
        
        msg!("New 'best person' poll created successfully");
        Ok(())
    }

    // Create a new poll for "worst person"
    pub fn create_worst_poll(
        ctx: Context<CreatePoll>,
        start_time: i64,
    ) -> Result<()> {
        let poll_system = &mut ctx.accounts.poll_system;
        let poll_account = &mut ctx.accounts.poll_account;
        
        // Verify creator is the authority
        require!(
            poll_system.authority == ctx.accounts.authority.key(),
            MememcoinVoteError::UnauthorizedPollCreation
        );
        
        // Set up new poll
        poll_account.poll_id = poll_system.worst_poll_current_id;
        poll_account.poll_type = PollType::Worst;
        poll_account.start_time = start_time;
        poll_account.end_time = start_time + poll_system.poll_duration;
        poll_account.is_active = true;
        poll_account.total_votes = 0;
        
        // Increment poll ID for next poll
        poll_system.worst_poll_current_id += 1;
        
        msg!("New 'worst person' poll created successfully");
        Ok(())
    }

    // Add a candidate to a poll
    pub fn add_candidate(
        ctx: Context<AddCandidate>,
        poll_id: u64,
        poll_type: PollType,
        name: String,
        wikipedia_url: String,
    ) -> Result<()> {
        let poll_system = &ctx.accounts.poll_system;
        let poll_account = &mut ctx.accounts.poll_account;
        let candidate_account = &mut ctx.accounts.candidate_account;
        
        // Verify authority
        require!(
            poll_system.authority == ctx.accounts.authority.key(),
            MememcoinVoteError::UnauthorizedCandidateAddition
        );
        
        // Verify poll is active
        require!(
            poll_account.is_active,
            MememcoinVoteError::InactivePoll
        );
        
        // Verify poll hasn't ended
        let clock = Clock::get()?;
        require!(
            clock.unix_timestamp < poll_account.end_time,
            MememcoinVoteError::PollEnded
        );

        // Setup candidate
        candidate_account.poll_id = poll_id;
        candidate_account.poll_type = poll_type;
        candidate_account.name = name;
        candidate_account.wikipedia_url = wikipedia_url;
        candidate_account.votes = 0;
        
        msg!("Candidate added successfully to poll");
        Ok(())
    }

    // Cast a vote for a candidate
    pub fn vote(
        ctx: Context<Vote>,
        poll_id: u64,
        poll_type: PollType,
    ) -> Result<()> {
        let token_account = &ctx.accounts.token_account;
        let poll_account = &mut ctx.accounts.poll_account;
        let candidate_account = &mut ctx.accounts.candidate_account;
        let user_vote_account = &mut ctx.accounts.user_vote_account;
        
        // Verify poll hasn't ended
        let clock = Clock::get()?;
        require!(
            clock.unix_timestamp < poll_account.end_time,
            MememcoinVoteError::PollEnded
        );
        
        // Verify poll is active
        require!(
            poll_account.is_active,
            MememcoinVoteError::InactivePoll
        );
        
        // Verify correct poll type and ID
        require!(
            poll_account.poll_id == poll_id && poll_account.poll_type == poll_type,
            MememcoinVoteError::InvalidPoll
        );
        
        // Verify user hasn't voted in this poll
        require!(
            !user_vote_account.has_voted,
            MememcoinVoteError::AlreadyVoted
        );
        
        // Calculate voting power based on token balance
        let voting_power = token_account.amount;
        require!(
            voting_power > 0,
            MememcoinVoteError::InsufficientVotingPower
        );
        
        // Record vote
        candidate_account.votes += voting_power;
        poll_account.total_votes += voting_power;
        user_vote_account.has_voted = true;
        user_vote_account.voting_power = voting_power;
        user_vote_account.vote_timestamp = clock.unix_timestamp;
        
        msg!("Vote cast successfully with {} voting power", voting_power);
        Ok(())
    }

    // Close poll and finalize results
    pub fn close_poll(
        ctx: Context<ClosePoll>,
        poll_id: u64,
        poll_type: PollType,
    ) -> Result<()> {
        let poll_system = &ctx.accounts.poll_system;
        let poll_account = &mut ctx.accounts.poll_account;
        
        // Verify authority
        require!(
            poll_system.authority == ctx.accounts.authority.key(),
            MememcoinVoteError::UnauthorizedPollClosure
        );
        
        // Verify correct poll
        require!(
            poll_account.poll_id == poll_id && poll_account.poll_type == poll_type,
            MememcoinVoteError::InvalidPoll
        );
        
        // Close poll
        poll_account.is_active = false;
        
        msg!("Poll closed successfully");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeToken<'info> {
    #[account(init, payer = authority, space = 8 + TokenMetadata::LEN)]
    pub token_metadata: Account<'info, TokenMetadata>,
    
    #[account(
        init,
        payer = authority,
        mint::decimals = 9,
        mint::authority = authority.key(),
    )]
    pub token_mint: Account<'info, Mint>,
    
    #[account(init, payer = authority, space = 8 + PollSystem::LEN)]
    pub poll_system: Account<'info, PollSystem>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CreatePoll<'info> {
    #[account(mut)]
    pub poll_system: Account<'info, PollSystem>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + Poll::LEN,
        seeds = [
            b"poll",
            poll_system.key().as_ref(),
            &[if poll_type == PollType::Best { poll_system.best_poll_current_id } else { poll_system.worst_poll_current_id }].as_ref()
        ],
        bump
    )]
    pub poll_account: Account<'info, Poll>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddCandidate<'info> {
    #[account(mut)]
    pub poll_system: Account<'info, PollSystem>,
    
    #[account(mut)]
    pub poll_account: Account<'info, Poll>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + Candidate::LEN,
        seeds = [
            b"candidate",
            poll_account.key().as_ref(),
            name.as_bytes()
        ],
        bump
    )]
    pub candidate_account: Account<'info, Candidate>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut)]
    pub poll_account: Account<'info, Poll>,
    
    #[account(mut)]
    pub candidate_account: Account<'info, Candidate>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserVote::LEN,
        seeds = [
            b"user_vote",
            poll_account.key().as_ref(),
            user.key().as_ref()
        ],
        bump
    )]
    pub user_vote_account: Account<'info, UserVote>,
    
    pub token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClosePoll<'info> {
    pub poll_system: Account<'info, PollSystem>,
    
    #[account(mut)]
    pub poll_account: Account<'info, Poll>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[account]
pub struct TokenMetadata {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub authority: Pubkey,
    pub decimals: u8,
    pub total_supply: u64,
    pub transaction_fee_bp: u16, // Basis points (1/100 of a percent)
    pub development_allocation: u8, // Percentage
    pub marketing_allocation: u8, // Percentage
    pub team_allocation: u8, // Percentage
    pub community_allocation: u8, // Percentage
    pub liquidity_allocation: u8, // Percentage
}

impl TokenMetadata {
    pub const LEN: usize = 32 + // name (max)
                          8 + // symbol (max)
                          200 + // uri (max)
                          32 + // authority
                          1 + // decimals
                          8 + // total_supply
                          2 + // transaction_fee_bp
                          1 + // development_allocation
                          1 + // marketing_allocation
                          1 + // team_allocation
                          1 + // community_allocation
                          1; // liquidity_allocation
}

#[account]
pub struct PollSystem {
    pub authority: Pubkey,
    pub best_poll_current_id: u64,
    pub worst_poll_current_id: u64,
    pub poll_duration: i64, // seconds
}

impl PollSystem {
    pub const LEN: usize = 32 + // authority
                          8 + // best_poll_current_id
                          8 + // worst_poll_current_id
                          8; // poll_duration
}

#[account]
pub struct Poll {
    pub poll_id: u64,
    pub poll_type: PollType,
    pub start_time: i64,
    pub end_time: i64,
    pub is_active: bool,
    pub total_votes: u64,
}

impl Poll {
    pub const LEN: usize = 8 + // poll_id
                          1 + // poll_type
                          8 + // start_time
                          8 + // end_time
                          1 + // is_active
                          8; // total_votes
}

#[account]
pub struct Candidate {
    pub poll_id: u64,
    pub poll_type: PollType,
    pub name: String,
    pub wikipedia_url: String,
    pub votes: u64,
}

impl Candidate {
    pub const LEN: usize = 8 + // poll_id
                          1 + // poll_type
                          64 + // name (max)
                          200 + // wikipedia_url (max)
                          8; // votes
}

#[account]
pub struct UserVote {
    pub has_voted: bool,
    pub voting_power: u64,
    pub vote_timestamp: i64,
}

impl UserVote {
    pub const LEN: usize = 1 + // has_voted
                          8 + // voting_power
                          8; // vote_timestamp
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Copy)]
pub enum PollType {
    Best,
    Worst,
}

#[error_code]
pub enum MememcoinVoteError {
    #[msg("Unauthorized poll creation")]
    UnauthorizedPollCreation,
    
    #[msg("Unauthorized candidate addition")]
    UnauthorizedCandidateAddition,
    
    #[msg("Unauthorized poll closure")]
    UnauthorizedPollClosure,
    
    #[msg("Poll has ended")]
    PollEnded,
    
    #[msg("Poll is inactive")]
    InactivePoll,
    
    #[msg("Invalid poll")]
    InvalidPoll,
    
    #[msg("User has already voted in this poll")]
    AlreadyVoted,
    
    #[msg("Insufficient voting power")]
    InsufficientVotingPower,
} 