"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const words = ["Here.", "Transparent.", "Immutable.", "Verifiable."];

export function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero-section">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
        <span className="hero-badge" style={{ boxShadow: '0 0 20px rgba(255,255,255,0.1)' }}>On-Chain Governance</span>
        <h1 className="hero-title" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.3em' }}>
          <span>The Future of Finance is</span>
          <span style={{ position: 'relative', display: 'inline-block', minWidth: '220px', height: '1.2em', textAlign: 'left' }}>
            <AnimatePresence mode="wait">
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
                transition={{ duration: 0.4 }}
                style={{ 
                  position: 'absolute', 
                  left: 0, 
                  color: '#34d399', 
                  WebkitTextFillColor: '#34d399',
                  textShadow: '0 0 20px rgba(52,211,153,0.4)' 
                }}
              >
                {words[index]}
              </motion.span>
            </AnimatePresence>
          </span>
        </h1>
        <p className="hero-subtitle">
          Participate in the live network consensus. Cast your vote seamlessly 
          using your Freighter wallet directly on the Stellar Soroban Testnet.
          Fully decentralized and transparent.
        </p>
      </motion.div>
    </section>
  );
}
