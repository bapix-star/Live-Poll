#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting Deployment Process for Stellar Live Poll..."

echo "1️⃣  Building the Soroban Smart Contract..."
cd contracts/poll
stellar contract build

echo "2️⃣  Deploying to Stellar Testnet..."
# Ensure the identity 'alice' exists. If not, it will prompt or fail, but this is standard overkill script.
CONTRACT_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/poll.wasm \
  --source default \
  --network testnet)

echo "✅ Deployment Successful!"
echo "📜 Contract ID: $CONTRACT_ID"
echo ""
echo "Please update your frontend .env.local file with:"
echo "NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ID"
echo ""
echo "🎉 You're all set to run the application!"
