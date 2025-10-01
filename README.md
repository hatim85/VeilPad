# **VeilPad**

[![Noir](https://img.shields.io/badge/Noir-v0.23.0-blue)](https://noir-lang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## **Description**

VeilPad is a **privacy-focused launchpad** built with **Noir**, enabling users to participate in token sales **anonymously and securely** using zero-knowledge proofs (ZKPs) and Merkle trees. By leveraging Noir's powerful ZK-SNARK circuits and cutting-edge cryptographic techniques, VeilPad ensures that users can prove their eligibility and contributions without revealing sensitive data, making token launches safer, fairer, and more decentralized.

## **Architecture**

VeilPad uses **Noir circuits** to generate and verify zero-knowledge proofs for:
- Whitelist eligibility verification
- Private contribution proofs
- Anonymous token claiming

All circuits are written in **Noir**, compiled to ACIR (Abstract Circuit Intermediate Representation), and verified on-chain using Barretenberg's Ultra Plonk backend.

## **Workflow**

### **1. Whitelist Phase**

- Users register for the whitelist by submitting their address to the whitelist contract.
- Their addresses are hashed using **Poseidon hash** (optimized for ZK circuits).
- A **Merkle tree** is constructed off-chain with all whitelisted addresses.
- The **Merkle root** is stored on-chain for decentralized verification.
- Users receive a **Merkle proof** for their inclusion in the whitelist.

### **2. Contribution Phase**

- After the whitelisting period ends, users contribute to the **marketplace contract**.
- A **Noir circuit** (`contribution.nr`) generates a ZK proof that:
  - Proves the user is in the whitelist (via Merkle proof verification)
  - Commits to their contribution amount without revealing it
  - Generates a nullifier to prevent double-spending
- The proof is verified on-chain using a **Solidity verifier contract** generated from the Noir circuit.
- Contribution commitments are added to a new **Merkle tree** for the claiming phase.

### **3. Claiming Phase**

- After the sale period ends, users generate a **ZK proof** using the `claim.nr` circuit to verify their contribution.
- The proof demonstrates:
  - Valid contribution in the contribution Merkle tree
  - Correct calculation of token allocation
  - Ownership of the contribution without revealing the address
- If the proof is valid, tokens are transferred to the user's address.
- The nullifier prevents the same proof from being used twice.

### **4. ZKVerify Integration**

- VeilPad integrates **ZKVerify** to enhance verification and security of zero-knowledge proofs.
- The **zkverifyjs** library is used to seamlessly integrate ZKVerify with the dApp.
- All Noir-generated proofs are submitted to ZKVerify for attestation.
- Ensures that all ZK proofs are validated efficiently and stored immutably before token distribution.

## **Key Features**

- **Noir-Powered ZK Circuits**: All privacy logic is implemented in Noir, a domain-specific language for zero-knowledge proofs.
- **Ultra Plonk Backend**: Uses Barretenberg's Ultra Plonk proving system for efficient proof generation and verification.
- **Poseidon Hash**: Optimized cryptographic hash function for ZK-friendly operations.
- **Merkle Tree Verification**: Both the **Merkle root** and individual proofs are verified in Noir circuits.
- **Privacy-Preserving Token Transfers**: Contributions remain hidden until the sale ends, preventing front-running.
- **Secure Whitelisting**: Participants prove eligibility via Noir-generated cryptographic proofs rather than public lists.
- **Decentralized & Trustless**: All proofs are verified **on-chain** using Solidity verifier contracts, eliminating centralized identity verification.
- **ZKVerify Integration**: Ensures secure and efficient validation of zero-knowledge proofs with immutable attestation.
- **Nullifier System**: Prevents double-claiming and ensures each proof can only be used once.

## **Technology Stack**

### **Zero-Knowledge Proofs**
- **Noir**: v0.23.0 - Domain-specific language for writing ZK circuits
- **Barretenberg**: Ultra Plonk proving backend
- **ACIR**: Abstract Circuit Intermediate Representation

### **Smart Contracts**
- **Solidity**: Smart contracts for on-chain verification
- **Noir Verifier**: Auto-generated Solidity verifier from Noir circuits

### **Backend**
- **TypeScript**: Backend API and proof generation
- **Node.js**: Runtime environment
- **MongoDB**: Off-chain data storage for Merkle trees and proofs

### **Frontend**
- **React**: Vite-based UI
- **Noir.js**: JavaScript library for interacting with Noir circuits
- **ethers.js**: Blockchain interaction

### **Blockchain**
- **Ethereum-compatible networks**: Deployment target
- **ZKVerify**: Proof attestation and verification layer

## **Noir Circuits**

### **Circuit Structure**

```
circuits/
├── src/
│   ├── main.nr              # Main circuit entry point
│   ├── whitelist.nr         # Whitelist verification circuit
│   ├── contribution.nr      # Contribution proof circuit
│   ├── claim.nr             # Token claiming circuit
│   └── lib/
│       ├── merkle.nr        # Merkle tree verification utilities
│       └── poseidon.nr      # Poseidon hash implementation
├── Nargo.toml               # Noir project configuration
└── Prover.toml              # Circuit inputs for testing
```

### **Key Circuits**

1. **Whitelist Circuit** (`whitelist.nr`):
   - Verifies Merkle proof of address inclusion
   - Outputs commitment for privacy

2. **Contribution Circuit** (`contribution.nr`):
   - Proves whitelist membership
   - Commits to contribution amount
   - Generates nullifier

3. **Claim Circuit** (`claim.nr`):
   - Verifies contribution proof
   - Calculates token allocation
   - Prevents double-claiming via nullifier

## **Getting Started**

### **Prerequisites**

- Node.js v18+
- Noir v0.23.0
- Nargo (Noir's package manager)

### **Installation**

```bash
# Install Noir
curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash
noirup

# Install dependencies
npm install

# Compile Noir circuits
cd circuits
nargo compile

# Generate Solidity verifier
nargo codegen-verifier
```

### **Running the Project**

```bash
# Start backend
cd api
npm run dev

# Start frontend
cd frontend
npm run dev
```

## **Circuit Compilation**

```bash
# Compile all circuits
nargo compile

# Run circuit tests
nargo test

# Generate proof for testing
nargo prove

# Verify proof
nargo verify
```

## **License**

This project is licensed under the MIT License.


