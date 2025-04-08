import { Keypair } from "@solana/web3.js";

const keypair = Keypair.generate();
console.log(`Public key: ${keypair.publicKey}`);
console.log(`Private key: ${JSON.stringify(Array.from(keypair.secretKey))}`);