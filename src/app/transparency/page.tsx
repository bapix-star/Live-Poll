'use client';

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { StellarHelper } from "@/lib/stellar";
import { ShieldCheck, Users, Activity, BarChart3, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import "../globals.css"; // Ensure globals are imported

export default function TransparencyPage() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);
  const [recentVotes, setRecentVotes] = useState<any[]>([]);
  const [results, setResults] = useState({ yes: 0, no: 0 });

  useEffect(() => {
    const h = new StellarHelper();
    
    const savedPk = localStorage.getItem('connected_wallet');
    if (savedPk) {
      setPublicKey(savedPk);
    }

    const fetchData = async () => {
      try {
        const [res, events] = await Promise.all([
          h.getResults(),
          h.getRecentVotes()
        ]);
        setTotalVotes(res.yes + res.no);
        setResults({ yes: res.yes, no: res.no });
        setRecentVotes(events);
      } catch (e) {
        console.error("Failed to fetch transparency data", e);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const connectWallet = async () => {
    setLoading(true);
    try {
      const h = new StellarHelper();
      const pk = await h.connectWallet();
      setPublicKey(pk);
      const bal = await h.getBalance(pk);
      setBalance(parseFloat(bal).toFixed(2));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setPublicKey(null);
    setBalance(null);
    localStorage.removeItem('connected_wallet');
  };

  const yesPercentage = totalVotes > 0 ? ((results.yes / totalVotes) * 100).toFixed(1) : "0.0";
  const noPercentage = totalVotes > 0 ? ((results.no / totalVotes) * 100).toFixed(1) : "0.0";

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

      <main className="main-content" style={{ padding: '4rem 5%', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ 
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', 
              width: '80px', height: '80px', borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(52, 211, 153, 0.2))',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#c4b5fd', marginBottom: '1.5rem'
            }}
          >
            <ShieldCheck size={40} />
          </motion.div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', fontFamily: 'var(--font-space)' }}>
            Network Transparency
          </h1>
          <p style={{ color: 'var(--secondary-text)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            Full-scale analysis and immutable on-chain verification of the Soroban Live Poll.
          </p>
        </div>

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          <div className="stat-card" style={{ padding: '2rem' }}>
            <div className="stat-card-icon" style={{ marginBottom: '1rem' }}><Users size={24} /></div>
            <div className="stat-label">Total Immutable Votes</div>
            <div className="stat-value" style={{ fontSize: '3rem' }}>{totalVotes}</div>
          </div>
          
          <div className="stat-card" style={{ padding: '2rem' }}>
            <div className="stat-card-icon" style={{ marginBottom: '1rem' }}><Activity size={24} /></div>
            <div className="stat-label">Recent Activity (Last 100 Ledgers)</div>
            <div className="stat-value" style={{ fontSize: '3rem' }}>{recentVotes.length}</div>
          </div>

          <div className="stats-distribution" style={{ margin: 0, padding: '2rem' }}>
            <h3 className="distribution-title"><BarChart3 size={20} /> Current Margin</h3>
            <div className="distribution-bars">
              <div className="dist-bar-wrapper">
                <div className="dist-label"><span>Yes</span> <span>{yesPercentage}%</span></div>
                <div className="dist-track">
                  <motion.div className="dist-fill dist-yes" initial={{ width: 0 }} animate={{ width: `${yesPercentage}%` }} transition={{ duration: 1 }} />
                </div>
              </div>
              <div className="dist-bar-wrapper" style={{ marginTop: '1.5rem' }}>
                <div className="dist-label"><span>No</span> <span>{noPercentage}%</span></div>
                <div className="dist-track">
                  <motion.div className="dist-fill dist-no" initial={{ width: 0 }} animate={{ width: `${noPercentage}%` }} transition={{ duration: 1 }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <section style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-space)' }}>Immutable Voter Ledger</h2>
            <span style={{ fontSize: '0.875rem', color: '#34d399', background: 'rgba(52, 211, 153, 0.1)', padding: '0.5rem 1rem', borderRadius: '99px' }}>Privacy Preserved</span>
          </div>
          
          <p style={{ color: 'var(--secondary-text)', marginBottom: '2rem' }}>
            Below is the list of all recently verified participants on the Stellar Testnet. To ensure absolute privacy, the specific opinion (Yes/No) is intentionally masked, while preserving the cryptographic proof of participation.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '1rem', color: 'var(--secondary-text)', fontWeight: 600 }}>Wallet Address</th>
                  <th style={{ padding: '1rem', color: 'var(--secondary-text)', fontWeight: 600 }}>Ledger Sequence</th>
                  <th style={{ padding: '1rem', color: 'var(--secondary-text)', fontWeight: 600 }}>Verification</th>
                </tr>
              </thead>
              <tbody>
                {recentVotes.length > 0 ? (
                  recentVotes.map((vote, i) => (
                    <motion.tr 
                      key={i} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <td style={{ padding: '1.25rem 1rem', fontFamily: 'monospace', color: '#fff' }}>
                        {vote.voter.substring(0, 12)}...{vote.voter.substring(vote.voter.length - 12)}
                      </td>
                      <td style={{ padding: '1.25rem 1rem', color: 'var(--secondary-text)' }}>
                        #{vote.ledger}
                      </td>
                      <td style={{ padding: '1.25rem 1rem' }}>
                        <a 
                          href={`https://stellar.expert/explorer/testnet/tx/${vote.txHash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#c4b5fd', textDecoration: 'none', fontSize: '0.875rem' }}
                        >
                          Verify on Explorer <ExternalLink size={14} />
                        </a>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '3rem', color: 'var(--secondary-text)' }}>
                      No recent votes found. Testnet nodes periodically purge older ledger events.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      <footer className="footer" style={{ marginTop: '4rem' }}>
        <p>© {new Date().getFullYear()} SorobanPoll. Built on the Stellar Network.</p>
      </footer>
    </>
  );
}
