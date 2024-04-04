// npm install @wormhole-foundation/sdk @wormhole-foundation/sdk/evm @wormhole-foundation/sdk/solana
import solanaWeb3 from "@solana/web3.js";
import pkg from 'bs58';
import { wormhole, Wormhole, isTokenId, amount } from "@wormhole-foundation/sdk";
import evm from "@wormhole-foundation/sdk/evm";
import solana from "@wormhole-foundation/sdk/solana";

// uncomment below if you want to import a token address
import dotenv from 'dotenv';
dotenv.config();
const PRIVATE_SOL = process.env.SOLANA_PRIVATE as string;
// const ADDRESS = process.env.MAPMETRICS as string; // Address of MapMetrics coin

// Used to convert private key to 64 byte representation
const { decode } = pkg;

async function generateKeyPairSolana() {
  // uses a phantom private key to derive a keypair to sign transactions
  const decoded = decode(PRIVATE_SOL);
  const keypair = solanaWeb3.Keypair.fromSecretKey(decoded);
  return keypair;
}

async function main() {
    const wh = await wormhole("Testnet", [evm, solana]); // will need to change to Mainnet when trying to transfer
  
    // Setup Solana and Moonbeam chains
    const sendChain = wh.getChain("Solana");  // MMAP is on Solana
    const rcvChain = wh.getChain("Moonbeam"); // Moonbeam is EVM-compatible
    
    // Prepare the token details for transfer
    const token = Wormhole.tokenId("Solana", "3Ftc5hTz9sG4huk79onufGiebJNDMZNL8HYgdMJ9E7JR"); // change to MapMetrics's contract address
    console.log(token);

    const amt = "0.001";

    // get solana signer
    const keypair = await generateKeyPairSolana();
    console.log(keypair);
    
    const decimals = isTokenId(token)
    ? Number(await wh.getDecimals(token.chain, token.address))
    : sendChain.config.nativeTokenDecimals;
    console.log(amount.units(amount.parse(amt, decimals)));

    // TODO transfer devnet solana tokens to moonbeam
     // TODO look at sample repo: https://github.com/wormhole-foundation/wormhole-sdk-ts/blob/main/examples/src/tokenBridge.ts
     // to see how to transfer tokens
  }
main();