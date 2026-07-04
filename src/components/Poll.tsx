import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface PollProps {
  totalVotes: number;
  yesPercentage: number;
  publicKey: string | null;
  voteLoading: boolean | null;
  handleVote: (choice: boolean) => void;
}

export function Poll({ totalVotes, yesPercentage, publicKey, voteLoading, handleVote }: PollProps) {
  return (
    <section id="poll" className="poll-section">
      <div className="poll-container">
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem', lineHeight: 1.2 }}>
            Should Soroban replace traditional financial systems?
          </h2>
          <p style={{ color: 'var(--secondary-text)' }}>
            Live on-chain results
          </p>
        </div>

        <div className="results-labels">
          <div className="label-block">
            <span className="label-title">Yes</span>
            <span className="label-value val-yes">{yesPercentage.toFixed(0)}%</span>
          </div>
          <div className="label-block" style={{ alignItems: 'flex-end' }}>
            <span className="label-title">No</span>
            <span className="label-value val-no">{(100 - yesPercentage).toFixed(0)}%</span>
          </div>
        </div>

        <div className="pie-chart-wrapper" style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0', position: 'relative' }}>
          <svg width="200" height="200" viewBox="0 0 200 200" style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}>
            <defs>
              <linearGradient id="yesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <linearGradient id="noGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
              <clipPath id="circleClip">
                <circle cx="100" cy="100" r="90" />
              </clipPath>
            </defs>
