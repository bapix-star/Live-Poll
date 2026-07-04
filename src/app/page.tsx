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
