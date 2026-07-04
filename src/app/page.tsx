"use client";

import { useEffect, useState } from "react";
import { StellarHelper, VoteEvent } from "@/lib/stellar";
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
      if (msg.toLowerCase().includes("not installed")) {
        setStatus({ type: 'error', message: "Wallet not found. Please install Freighter." });
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
