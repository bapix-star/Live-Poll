import { motion, AnimatePresence } from "framer-motion";
import { History, ArrowRight, Loader2 } from "lucide-react";
import { VoteEvent } from "@/lib/stellar";

interface ActivityFeedProps {
  recentVotes: VoteEvent[];
}

export function ActivityFeed({ recentVotes }: ActivityFeedProps) {
  return (
    <section id="history" className="history-section">
      <div className="history-header">
        <h2 className="history-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={24} /> Recent On-Chain Activity
        </h2>
      </div>
      
      <div className="history-list">
        <AnimatePresence>
          {recentVotes.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
              style={{ textAlign: 'center', padding: '3rem', color: 'var(--secondary-text)', border: '1px dashed var(--surface-border)', borderRadius: '16px' }}
            >
              <History size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--primary-text)', marginBottom: '0.5rem' }}>No recent votes found</p>
              <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>Testnet nodes only retain events for the last few hours.</p>
              <p style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.5rem' }}>Older votes are still safely counted in the total above.</p>
            </motion.div>
          ) : (
            recentVotes.map((vote, idx) => (
              <motion.a
                key={`${vote.ledger}-${vote.voter}-${idx}`}
                href={`https://stellar.expert/explorer/testnet/tx/${vote.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="history-item"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div>
                  <div className="history-voter">
                    {vote.voter.substring(0, 6)}...{vote.voter.substring(vote.voter.length - 4)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', marginTop: '4px' }}>
                    Ledger {vote.ledger}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className={`history-choice ${vote.choice}`}>
                    Voted {vote.choice}
                  </div>
                  <ArrowRight size={16} style={{ color: 'var(--secondary-text)' }} />
                </div>
              </motion.a>
            ))
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
