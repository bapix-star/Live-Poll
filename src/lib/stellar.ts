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

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "CDPWAC4OVVIBQKX6PEZZHEZLQG272VUMKMII3UKSZYESJCYQYVVNZPDA";
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
          network: walletNetwork,
          selectedWalletId: 'freighter',
          modules: [
            new FreighterModule(),
            new xBullModule(),
            new LobstrModule()
          ],
        });
      } catch (e) {
      }
    }
  }

  async connectWallet(): Promise<string> {
    const result = await StellarWalletsKit.authModal();
    return result.address;
  }

  async getBalance(publicKey: string): Promise<string> {
    try {
      const res = await fetch(`https://horizon-testnet.stellar.org/accounts/${publicKey}`);
      if (!res.ok) return "0.00";
      const data = await res.json();
      const nativeBalance = data.balances.find((b: any) => b.asset_type === 'native');
      return nativeBalance ? nativeBalance.balance : "0.00";
    } catch (e) {
      return "0.00";
    }
  }

  async getResults(): Promise<{ yes: number; no: number }> {
    const contract = new Contract(CONTRACT_ADDRESS);
    
    const tx = new TransactionBuilder(await this.getDummyAccount(), {
      fee: '100',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call('get_results'))
      .setTimeout(30)
      .build();

    const prepared = await this.server.prepareTransaction(tx);
    const simulation = await this.server.simulateTransaction(prepared);

    if (!rpc.Api.isSimulationSuccess(simulation) || !simulation.result?.retval) {
      throw new Error("Unable to decode contract results or simulation failed");
    }

    const resultXdr = simulation.result.retval;
    if (resultXdr.switch() !== xdr.ScValType.scvVec()) {
      throw new Error("Unexpected contract return type");
    }

    const vec = resultXdr.vec()!;
    if (vec.length < 2) {
      throw new Error("Invalid tuple length from contract");
    }
    
    const yes = vec[0].u32();
    const no = vec[1].u32();
    return { yes, no };
  }

  async getRecentVotes(): Promise<VoteEvent[]> {
    try {
      const latestLedger = await this.server.getLatestLedger();
      const startLedger = Math.max(1, latestLedger.sequence - 10000);

      const response = await this.server.getEvents({
        startLedger,
        filters: [
          {
            type: "contract",
            contractIds: [CONTRACT_ADDRESS],
          }
        ],
        limit: 15,
      });

      const votes: VoteEvent[] = [];
      for (const event of response.events) {
        if (event.type !== "contract") continue;
        
        try {
          if (event.topic.length < 2) continue;
          
          const t1 = event.topic[0].sym().toString();
          if (t1 !== "vote") continue;
          
          const choice = event.topic[1].sym().toString();
          const voter = scValToNative(event.value) as string;
          
          votes.push({
            voter,
            choice,
            ledger: parseInt(event.ledger as any) || event.ledger,
            txHash: event.txHash
          });
        } catch (e) {
        }
      }
      return votes.reverse();
    } catch (e) {
      console.error("Failed to fetch recent votes:", e);
      return [];
    }
  }

  async vote(publicKey: string, choice: boolean): Promise<string> {
    const contract = new Contract(CONTRACT_ADDRESS);

    let account;
    try {
      account = await this.server.getAccount(publicKey);
    } catch (e: any) {
      if (e?.response?.status === 404) {
        throw new Error("Account not found. Please fund your wallet first!");
      }
      throw new Error(`Failed to fetch account: ${e.message || "Network error"}`);
    }

    const tx = new TransactionBuilder(account, {
      fee: '1000',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'vote',
          new Address(publicKey).toScVal(),
          xdr.ScVal.scvU32(choice ? 1 : 0)
        )
      )
      .setTimeout(30)
      .build();

    let preparedTx;
    try {
      preparedTx = await this.server.prepareTransaction(tx);
    } catch (e: any) {
      const msg = e.message || "";
      if (
        msg.includes("Error(Contract, #1)") || 
        msg.includes("InvalidAction") || 
        msg.includes("UnreachableCodeReached") || 
        msg.includes("WasmVm")
      ) {
        throw new Error("You have already voted!");
      }
      if (msg.includes("Error(Contract, #2)")) {
        throw new Error("This poll is closed!");
      }
      if (msg.includes("Error(Contract, #3)")) {
        throw new Error("Invalid voting option!");
      }
      throw new Error(`Transaction simulation failed: ${msg}`);
    }

    let signedTxXdr;
    try {
      const result = await StellarWalletsKit.signTransaction(preparedTx.toXDR());
      signedTxXdr = result.signedTxXdr;
    } catch (e: any) {
      throw new Error("Transaction rejected by wallet.");
    }

    let sendResponse;
    try {
      sendResponse = await this.server.sendTransaction(
        TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE)
      );
    } catch (e: any) {
      console.error("Submit error:", e);
      throw new Error(`Failed to submit transaction: ${e.message}`);
    }

    if (sendResponse.status === 'ERROR') {
      const errorStr = JSON.stringify(sendResponse);
      if (errorStr.includes('tx_insufficient_balance')) {
        throw new Error("Insufficient balance to complete the transaction.");
      }
      throw new Error(`Transaction failed: ${errorStr}`);
    }

    return await this.pollTransaction(sendResponse.hash);
  }

  private async getDummyAccount() {
    return {
        accountId: () => 'GAUTVVO7UG5S67XVVTF2KYD2SBIVVE623KEIMDY3OG3QNAGUVDZ2JO6J',
        sequenceNumber: () => '1',
        incrementSequenceNumber: () => {},
    } as any;
  }

  private async pollTransaction(hash: string): Promise<string> {
    const server = this.server;
    let status = await server.getTransaction(hash);
    
    let delay = 1000;
    for (let i = 0; i < 12; i++) {
        if (status.status !== 'NOT_FOUND') {
            break;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * 1.5, 5000);
        status = await server.getTransaction(hash);
    }

    if (status.status === 'SUCCESS') {
        return hash;
    } else {
        throw new Error(`Transaction failed on chain: ${JSON.stringify(status)}`);
    }
  }
}
