// npm install @wormhole-foundation/sdk @wormhole-foundation/sdk/evm @wormhole-foundation/sdk/solana

import { wormhole, TokenId, Wormhole } from "@wormhole-foundation/sdk";
import evm from "@wormhole-foundation/sdk/evm";
import solana from "@wormhole-foundation/sdk/solana";
//import { getSigner, waitLog } from "./helpers/index.js"; // Ensure helpers are implemented
import dotenv from 'dotenv';

dotenv.config();
const ADDRESS = process.env.MAPMETRICS as string; // Address of MapMetrics coin

async function main() {
    const wh = await wormhole("Testnet", [evm, solana]); // will need to change to Mainnet when trying to transfer
  
    // Setup Solana and Moonbeam chains
    const sendChain = wh.getChain("Solana");  // MMAP is on Solana
    const rcvChain = wh.getChain("Ethereum"); // Moonbeam is EVM-compatible
  
    // Prepare the token details for transfer
     const token = Wormhole.tokenId("Solana", ADDRESS);
     console.log(token);
  }
main();