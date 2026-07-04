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
