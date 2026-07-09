"use client";

import { useEffect, useState } from "react";
import { StellarHelper, VoteEvent, CONTRACT_ADDRESS } from "@/lib/stellar";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Poll } from "@/components/Poll";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Toast } from "@/components/Toast";
import "./globals.css";

export default function Home() {
  const [helper, setHelper] = useState<StellarHelper | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [results, setResults] = useState({ yes: 0, no: 0 });
  const [recentVotes, setRecentVotes] = useState<VoteEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [voteLoading, setVoteLoading] = useState<boolean | null>(null);
  const [status, setStatus] = useState<{ type: 'error' | 'success' | 'pending'; message: string } | null>(null);
  const [isHoveringWallet, setIsHoveringWallet] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [knownVotedStatus, setKnownVotedStatus] = useState<boolean>(false);

  // Compute personalized transparency data
  const userRecentVote = publicKey 
    ? recentVotes.find(v => v.voter === publicKey) 
    : undefined;
  const hasVoted = !!userRecentVote || knownVotedStatus;
  const userVoteChoice = (userRecentVote?.choice as 'Yes' | 'No') || 'Hidden (Archived Ledger)';

  useEffect(() => {
    const h = new StellarHelper();
    setHelper(h);

    const savedPk = localStorage.getItem('connected_wallet');
    if (savedPk) {
      setPublicKey(savedPk);
    }
    
    let isFetching = false;
    const fetchAll = async () => {
      if (isFetching) return;
      isFetching = true;
      try {
        const [res, events] = await Promise.all([
          h.getResults(),
          h.getRecentVotes()
        ]);
        setResults(res);
        setRecentVotes(events);
      } catch(e) {
        console.error(e);
      } finally {
        isFetching = false;
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (publicKey && helper) {
      localStorage.setItem('connected_wallet', publicKey);
      helper.getBalance(publicKey).then(b => setBalance(parseFloat(b).toFixed(2)));
    } else {
      setBalance(null);
    }
  }, [publicKey, helper]);

  const connectWallet = async () => {
    if (!helper) return;
    try {
      setLoading(true);
      setStatus(null);
      const pk = await helper.connectWallet();
      setPublicKey(pk);
    } catch (e: any) {
      const msg = e?.message || "Failed to connect wallet.";
      if (msg.toLowerCase().includes("not installed") || msg.toLowerCase().includes("not found")) {
        setStatus({ type: 'error', message: "Wallet not found. Please install Freighter or another compatible wallet." });
      } else {
        setStatus({ type: 'error', message: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setPublicKey(null);
    localStorage.removeItem('connected_wallet');
    setStatus({ type: 'success', message: "Wallet disconnected successfully." });
  };

  const handleVote = async (choice: boolean) => {
    if (!helper || !publicKey) return;
    try {
      setVoteLoading(choice);
      setStatus({ type: 'pending', message: "Confirming transaction in wallet..." });
      const hash = await helper.vote(publicKey, choice);
      setStatus({ type: 'success', message: `Vote confirmed! Hash: ${hash.substring(0, 8)}...` });
      
      const newResults = await helper.getResults();
      setResults(newResults);
      helper.getRecentVotes().then(setRecentVotes);
    } catch (e: any) {
      let errorMsg = e.message || "An unknown error occurred.";
      if (errorMsg.includes("Already voted") || errorMsg.includes("You have already voted!")) {
        errorMsg = "You have already voted!";
        setKnownVotedStatus(true);
      } else if (errorMsg.includes("rejected")) {
        errorMsg = "Transaction was rejected in the wallet.";
      } else if (errorMsg.length > 80) {
         errorMsg = errorMsg.substring(0, 80) + "...";
      }
      setStatus({ type: 'error', message: errorMsg });
    } finally {
      setVoteLoading(null);
    }
  };

  const totalVotes = results.yes + results.no;
  const yesPercentage = totalVotes > 0 ? (results.yes / totalVotes) * 100 : 50;

  useEffect(() => {
    if (status && status.type !== 'pending') {
      const timer = setTimeout(() => setStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <>
      <div className="ambient-light" />
      
      <Navbar 
        publicKey={publicKey} 
        balance={balance}
        loading={loading} 
        connectWallet={connectWallet} 
        disconnectWallet={disconnectWallet} 
      />

      <main className="main-content">
        <Hero />
        
        <Poll 
          totalVotes={totalVotes}
          yesPercentage={yesPercentage}
          publicKey={publicKey}
          voteLoading={voteLoading}
          handleVote={handleVote}
          hasVoted={hasVoted}
          userVoteChoice={userVoteChoice}
        />

        <ActivityFeed recentVotes={recentVotes} />

        <footer className="footer">
          <p>© {new Date().getFullYear()} SorobanPoll. Built on the Stellar Network.</p>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
            <a href="https://developers.stellar.org/docs/smart-contracts" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--secondary-text)', textDecoration: 'none' }}>Documentation</a>
            <a href="https://github.com/late-cat/Stellar-Live-Poll" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--secondary-text)', textDecoration: 'none' }}>Source Code</a>
            <a href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ADDRESS}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--secondary-text)', textDecoration: 'none' }}>Testnet Explorer</a>
          </div>
        </footer>

        <Toast status={status} />
      </main>
    </>
  );
}
