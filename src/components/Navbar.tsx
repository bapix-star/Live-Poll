import { useState } from "react";
import { Wallet, Loader2, LogOut, Menu, X, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  publicKey: string | null;
  balance: string | null;
  loading: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

export function Navbar({ publicKey, balance, loading, connectWallet, disconnectWallet }: NavbarProps) {
  const [isHoveringWallet, setIsHoveringWallet] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }} onClick={closeMobileMenu}>
            <div className="status-dot" style={{ position: 'relative', display: 'inline-block', marginRight: '8px' }} />
            SorobanPoll
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="nav-links desktop-only">
          <Link href="/#poll" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>Live Poll</Link>
          <Link href="/#history" className="nav-link">Recent Activity</Link>
          <Link href="/transparency" className={`btn-stats ${pathname === '/transparency' ? 'active-stats' : ''}`}>
            <ShieldCheck size={16} />
            <span>Transparency</span>
          </Link>
        </div>

        <div className="nav-actions">
          {/* Constantly Visible Wallet */}
          {publicKey ? (
            <button 
              onClick={disconnectWallet} 
              onMouseEnter={() => setIsHoveringWallet(true)}
              onMouseLeave={() => setIsHoveringWallet(false)}
              className="wallet-badge" 
            >
              {isHoveringWallet ? (
                <>
                  <LogOut size={16} />
                  <span>Disconnect</span>
                </>
              ) : (
                <>
                  <Wallet size={16} />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
                    <span style={{ fontSize: '0.85rem' }}>{publicKey.slice(0, 4)}...{publicKey.slice(-4)}</span>
                    {balance && <span className="wallet-balance" style={{ fontSize: '0.7rem', color: 'var(--secondary-text)' }}>{balance} XLM</span>}
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

          {/* Mobile Hamburger Icon */}
          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Slide-out Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="mobile-menu-overlay"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mobile-nav-links">
              <Link href="/#poll" className="mobile-nav-link" onClick={closeMobileMenu}>Live Poll</Link>
              <Link href="/#history" className="mobile-nav-link" onClick={closeMobileMenu}>Recent Activity</Link>
              <Link href="/transparency" className="mobile-nav-link stats-link" onClick={closeMobileMenu}>
                <ShieldCheck size={18} /> Transparency Dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
