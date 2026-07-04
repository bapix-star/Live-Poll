import { useState } from "react";
import { Wallet, Loader2, LogOut } from "lucide-react";

interface NavbarProps {
  publicKey: string | null;
  balance: string | null;
  loading: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

export function Navbar({ publicKey, balance, loading, connectWallet, disconnectWallet }: NavbarProps) {
  const [isHoveringWallet, setIsHoveringWallet] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <div className="status-dot" style={{ position: 'relative', display: 'inline-block', marginRight: '8px' }} />
        SorobanPoll
      </div>
      <div className="nav-links">
        <a href="#poll" className="nav-link">Live Poll</a>
        <a href="#history" className="nav-link">Recent Activity</a>
        {publicKey ? (
          <button 
            onClick={disconnectWallet} 
            onMouseEnter={() => setIsHoveringWallet(true)}
            onMouseLeave={() => setIsHoveringWallet(false)}
            className="wallet-badge" 
            style={{ 
              cursor: 'pointer', 
              background: isHoveringWallet ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.08)', 
              borderColor: isHoveringWallet ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.1)', 
              color: isHoveringWallet ? '#fca5a5' : 'var(--primary-text)', 
              transition: 'all 0.2s', 
              width: balance ? '220px' : '150px', 
              justifyContent: 'center',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }} 
          >
            {isHoveringWallet ? (
              <>
                <LogOut size={16} />
                Disconnect
              </>
            ) : (
              <>
                <Wallet size={16} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
                  <span style={{ fontSize: '0.85rem' }}>{publicKey.slice(0, 4)}...{publicKey.slice(-4)}</span>
                  {balance && <span style={{ fontSize: '0.7rem', color: 'var(--secondary-text)' }}>{balance} XLM</span>}
                </div>
              </>
            )}
          </button>
        ) : (
          <button onClick={connectWallet} disabled={loading} className="btn-connect">
            {loading ? <Loader2 className="icon-spin" size={16} /> : <Wallet size={16} />}
            Connect
          </button>
        )}
      </div>
    </nav>
  );
}
