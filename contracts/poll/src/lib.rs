#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env};

#[contracterror]
#[derive(Copy, Clone, Eq, PartialEq, Debug)]
pub enum PollError {
    AlreadyVoted = 1,
    PollClosed = 2,
    InvalidOption = 3,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    YesCount,
    NoCount,
    Voted(Address),
    Closed,
}

#[contract]
pub struct PollContract;

#[contractimpl]
impl PollContract {
    pub fn close_poll(env: Env) {
        env.storage().instance().set(&DataKey::Closed, &true);
    }

    pub fn vote(env: Env, voter: Address, choice: u32) -> Result<(), PollError> {
        voter.require_auth();

        if env.storage().instance().has(&DataKey::Closed) {
            return Err(PollError::PollClosed);
        }

        if choice != 0 && choice != 1 {
            return Err(PollError::InvalidOption);
        }

        let has_voted_key = DataKey::Voted(voter.clone());
        if env.storage().temporary().has(&has_voted_key) {
            return Err(PollError::AlreadyVoted);
        }

        env.storage().temporary().set(&has_voted_key, &true);
        // Extend TTL to roughly 7 days (assuming ~5 seconds per ledger, 17280 * 7 ~ 120960 ledgers)
        env.storage().temporary().extend_ttl(&has_voted_key, 1000, 120000);

        if choice == 1 {
            let mut yes_count: u32 = env.storage().persistent().get(&DataKey::YesCount).unwrap_or(0);
            yes_count += 1;
            env.storage().persistent().set(&DataKey::YesCount, &yes_count);
            env.events().publish((symbol_short!("vote"), symbol_short!("yes")), voter);
        } else {
            let mut no_count: u32 = env.storage().persistent().get(&DataKey::NoCount).unwrap_or(0);
            no_count += 1;
            env.storage().persistent().set(&DataKey::NoCount, &no_count);
            env.events().publish((symbol_short!("vote"), symbol_short!("no")), voter);
        }
        Ok(())
    }

    pub fn get_results(env: Env) -> (u32, u32) {
        let yes_count: u32 = env.storage().persistent().get(&DataKey::YesCount).unwrap_or(0);
        let no_count: u32 = env.storage().persistent().get(&DataKey::NoCount).unwrap_or(0);
        (yes_count, no_count)
    }
}
