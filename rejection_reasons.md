# Potential Rejection Reasons for Stellar Live Poll

After reviewing the `Live-Poll` repository against the Level 2 (Yellow Belt) requirements and comparing it with the passing `Stellar-Learn-To-Earn` repository, here are the likely reasons why the submission was rejected:

1. **Incorrect Challenge Designation in README**
   The project explicitly calls itself a "White Belt Challenge Submission" in the README's subtitle and checklist sections. The requirements state this is Level 2 (which corresponds to Yellow Belt). This makes it seem like the submission was submitted for the wrong level or the instructions were not followed.

2. **Checklist Misalignment for Error Handling**
   The requirement explicitly asks for "3 error types handled: wallet not found, rejected, insufficient balance". 
   In the README's checklist, the author wrote:
   `- [x] 3 error types handled: The smart contract throws and the UI gracefully decodes AlreadyVoted, PollClosed, and InvalidOption.`
   While the correct UI error handling *is* implemented elsewhere in the code, the checklist fails to highlight the specific required errors, which could cause a reviewer scanning the checklist to reject it.

3. **Mismatched Contract Addresses**
   The README states the deployed contract address is `CBBKRRX4JUV2WABG43LIBU77ZXSZ5D3RXLPXUJA4M3LQM7K2XLMOHWMJ`. However, the footer in the application (`src/app/page.tsx`) links to a completely different contract address on the Stellar Expert block explorer: `CDLCLCOYFQC2DXGHWGCST4FWQOANS3QBXPSC3P2Q3D4JXWCEC7HTF7KP`. This discrepancy makes the project look unpolished or copied.

4. **Missing Smart Contract Deployment Instructions**
   The prompt mentions "Deploying a contract to the testnet" as a learning goal. While the contract source is included, the README lacks any instructions on how to build, test, or deploy the smart contract using the Soroban CLI. The Orange Belt reference repo (`Stellar-Learn-To-Earn`) clearly documents the commands required to deploy the contract.

5. **Lack of Architecture/Flow Diagram**
   While not strictly required for Level 2, the reference Orange belt repo provides a clear Mermaid sequence diagram illustrating the smart contract flow. Providing one elevates the project's quality and demonstrates a deeper understanding of the system's architecture.
