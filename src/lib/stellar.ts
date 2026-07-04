import {
  StellarWalletsKit,
  Networks as WalletNetworks,
} from '@creit.tech/stellar-wallets-kit';
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull';
import { LobstrModule } from '@creit.tech/stellar-wallets-kit/modules/lobstr';
import { rpc, TransactionBuilder, Networks, Address, Contract, xdr, scValToNative } from '@stellar/stellar-sdk';

export interface VoteEvent {
  voter: string;
  choice: string;
  ledger: number;
  txHash: string;
}

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "CBBKRRX4JUV2WABG43LIBU77ZXSZ5D3RXLPXUJA4M3LQM7K2XLMOHWMJ";
export const RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";
export const NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE || Networks.TESTNET;

export class StellarHelper {
  server: rpc.Server;

  constructor() {
    this.server = new rpc.Server(RPC_URL);
    
    if (typeof window !== 'undefined') {
      try {
        const walletNetwork = NETWORK_PASSPHRASE === Networks.PUBLIC ? WalletNetworks.PUBLIC : WalletNetworks.TESTNET;
        StellarWalletsKit.init({
