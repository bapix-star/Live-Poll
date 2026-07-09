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

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_voting() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PollContract);
        let client = PollContractClient::new(&env, &contract_id);

        let user1 = Address::generate(&env);
        let user2 = Address::generate(&env);

        env.mock_all_auths();

        // Vote Yes
        client.vote(&user1, &1);
        let results = client.get_results();
        assert_eq!(results, (1, 0));

        // Vote No
        client.vote(&user2, &0);
        let results = client.get_results();
        assert_eq!(results, (1, 1));
    }

    #[test]
    fn test_error_already_voted() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PollContract);
        let client = PollContractClient::new(&env, &contract_id);
        let user = Address::generate(&env);
        env.mock_all_auths();

        client.vote(&user, &1);
        
        let result = client.try_vote(&user, &1);
        assert_eq!(result, Err(Ok(PollError::AlreadyVoted)));
    }

    #[test]
    fn test_error_invalid_option() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PollContract);
        let client = PollContractClient::new(&env, &contract_id);
        let user = Address::generate(&env);
        env.mock_all_auths();

        let result = client.try_vote(&user, &5);
        assert_eq!(result, Err(Ok(PollError::InvalidOption)));
    }

    #[test]
    fn test_error_poll_closed() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PollContract);
        let client = PollContractClient::new(&env, &contract_id);
        let user = Address::generate(&env);
        env.mock_all_auths();

        client.close_poll();
        
        let result = client.try_vote(&user, &1);
        assert_eq!(result, Err(Ok(PollError::PollClosed)));
    }
}

