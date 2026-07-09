import { motion } from "framer-motion";
import { Loader2, ThumbsUp, ThumbsDown, UserCheck } from "lucide-react";

interface PollProps {
  totalVotes: number;
  yesPercentage: number;
  publicKey: string | null;
  voteLoading: boolean | null;
  handleVote: (choice: boolean) => void;
  hasVoted: boolean;
  userVoteChoice: string | null;
}

export function Poll({ totalVotes, yesPercentage, publicKey, voteLoading, handleVote, hasVoted, userVoteChoice }: PollProps) {
  return (
    <section id="poll" className="poll-section">
      <div className="poll-container">
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem', lineHeight: 1.2 }}>
            Should Soroban replace traditional financial systems?
          </h2>
          {publicKey && hasVoted && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="my-vote-badge"
            >
              <UserCheck size={16} /> 
              You voted {userVoteChoice === 'Hidden (Archived Ledger)' ? 'but choice is archived by the network' : userVoteChoice}
            </motion.div>
          )}
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
            
            <circle cx="100" cy="100" r="90" fill="url(#noGrad)" opacity="0.8" />
            
            <g clipPath="url(#circleClip)">
              <motion.g
                initial={{ y: 200 }}
                animate={{ y: 190 - (totalVotes === 0 ? 50 : yesPercentage) / 100 * 180 }}
                transition={{ type: "spring", bounce: 0.2, duration: 2 }}
              >
                <motion.path 
                  d="M 0 0 Q 50 12, 100 0 T 200 0 T 300 0 T 400 0 L 400 200 L 0 200 Z"
                  fill="#34d399"
                  opacity="0.5"
                  animate={{ x: [0, -200] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                />
              </motion.g>

              <motion.g
                initial={{ y: 200 }}
                animate={{ y: 190 - (totalVotes === 0 ? 50 : yesPercentage) / 100 * 180 }}
                transition={{ type: "spring", bounce: 0.2, duration: 2 }}
              >
                <motion.path 
                  d="M 0 0 Q 50 -12, 100 0 T 200 0 T 300 0 T 400 0 L 400 200 L 0 200 Z"
                  fill="url(#yesGrad)"
                  opacity="0.9"
                  animate={{ x: [-200, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                />
              </motion.g>

              {[
                { id: 1, x: 50, r: 4, dur: 2.5, delay: 0.2, drift: 10 },
                { id: 2, x: 90, r: 3, dur: 3.2, delay: 1.5, drift: -8 },
                { id: 3, x: 130, r: 5, dur: 2.8, delay: 0.8, drift: 12 },
                { id: 4, x: 170, r: 2, dur: 3.5, delay: 2.1, drift: -5 },
                { id: 5, x: 110, r: 4, dur: 2.2, delay: 0.5, drift: 8 }
              ].map((b) => (
                <motion.circle
                  key={b.id}
                  r={b.r}
                  fill="rgba(255,255,255,0.7)"
                  initial={{ x: b.x, y: 190, opacity: 0 }}
                  animate={{ 
                    y: [190, Math.max(20, 190 - (totalVotes === 0 ? 50 : yesPercentage) / 100 * 180)], 
                    x: [b.x, b.x + b.drift],
                    opacity: [0, 1, 0] 
                  }}
                  transition={{ repeat: Infinity, duration: b.dur, delay: b.delay, ease: "easeIn" }}
                />
              ))}
            </g>

            <circle cx="100" cy="100" r="90" fill="transparent" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
            <circle cx="100" cy="100" r="90" fill="transparent" stroke="rgba(0,0,0,0.3)" strokeWidth="2" />
          </svg>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Total</span>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.1, textShadow: '0 2px 10px rgba(0,0,0,0.5)', color: '#fff' }}>{totalVotes}</span>
          </div>
        </div>

        <div className="actions">
          <button
            onClick={() => handleVote(true)}
            disabled={!publicKey || voteLoading !== null}
            className="btn-vote yes"
          >
            <div className="btn-bg-glow" />
            {voteLoading === true ? <Loader2 className="icon-spin" size={24} /> : "Vote Yes"}
          </button>

          <button
            onClick={() => handleVote(false)}
            disabled={!publicKey || voteLoading !== null}
            className="btn-vote no"
          >
            <div className="btn-bg-glow" />
            {voteLoading === false ? <Loader2 className="icon-spin" size={24} /> : "Vote No"}
          </button>
        </div>
      </div>
    </section>
  );
}
