// npm install @wormhole-foundation/sdk @wormhole-foundation/sdk/evm @wormhole-foundation/sdk/solana
import solanaWeb3 from "@solana/web3.js";
import pkg from 'bs58';
import { ethers } from 'ethers';
import { Chain,
  ChainAddress,
  Network,
  TokenId,
  TokenTransfer,
  Wormhole,
  amount,
  isTokenId,
  wormhole,
  UniversalOrNative,
  NativeAddress, 
  ChainContext,
  Signer, } from "@wormhole-foundation/sdk";
import evm from "@wormhole-foundation/sdk/evm";
import solana from "@wormhole-foundation/sdk/solana";
import dotenv from 'dotenv';

// env vars
dotenv.config();
const PRIVATE_SOL = process.env.SOLANA_PRIVATE as string;
const PRIVATE_EVM = process.env.METAMASK_PRIVATE as string;
// const MAPMETRICSADDRESS = process.env.MAPMETRICS as string; // Address of MapMetrics coin

// Used to convert private key to 64 byte representation
const { decode } = pkg;

// Objects that will need to be passed into wormhole's tokenTransfer function as source & destination
// Needs to have proper types assigned to them - still trying to figure out 
type SourceSigner<N, Chain> = {
  address: ChainAddress;
  chain: ChainContext<"Testnet", "Solana">;
  signer: Signer;
};

type DestinationSigner<N, Chain> = {
  address: ChainAddress;
  chain: ChainContext<"Testnet", "Moonbeam">;
  signer: Signer;
};

// Creates a signer for Solana dev-net wallet. Currently using a dummy object to mock SourceSigner<N, Chain>
// TODO update the object that is returned. Needs to be of type SourceSigner<N, Chain>
async function generateKeyPairSolana(address: string) {
  // uses a phantom private key on Solana devnet to derive a keypair to sign transactions
  const decoded = decode(PRIVATE_SOL);
  const keypair = solanaWeb3.Keypair.fromSecretKey(decoded);

  // mocking own object before correctly typecasting to the wormhole tokenTransfer function
  const source = {
    address: address,
    chain: 'Solana',
    signer: keypair,
  };
  return source;
}

// Creates a signer for Moonbase alpha's test wallet. Currently using a dummy object to mock DestinationSigner<N, Chain>
// TODO update the object that is returned. Needs to be of type DestinationSigner<N, Chain>
async function getSignerEVM(address: string) {
  // RCP for MoonRiver https://docs.moonbeam.network/builders/get-started/networks/moonbeam/
  // RCP for Moonbase Alpha https://docs.moonbeam.network/learn/platform/networks/moonbase/
  const providerURL = 'https://rpc.api.moonbase.moonbeam.network';

  // Need to change to moonriver rpc for live tokens
  const provider = new ethers.JsonRpcProvider(providerURL, {
      chainId: 1287,
      name: 'moonbase-alphanet'
  });
  const wallet_signer = new ethers.Wallet(PRIVATE_EVM, provider);

  // mocking own object before correctly typecasting to the wormhole tokenTransfer function
  const destination = {
    address: address,
    chain: 'Moonbase-Alphanet',
    signer: wallet_signer,
  };
  return destination
}

async function main() {
    const wh = await wormhole("Testnet", [evm, solana]); // will need to change to Mainnet when trying to transfer
  
    // Setup Solana and Moonbeam chains
    const sendChain = wh.getChain("Solana");  // MMAP is on Solana
    const rcvChain = wh.getChain("Moonbeam"); // Moonbeam is EVM-compatible

    // uncomment to see chain details
    // console.log(sendChain);
    // console.log(rcvChain);

    // Test to see which address must be passed to initiate the transfer, I'm guessing token bridge relayer??
    // Will need to update addresses to be of type ChainAddress so wormhole's tokenTransfer can handle it correctly
    const sourceAddress = sendChain.config.contracts.tokenBridgeRelayer as string;
    const destAddress = rcvChain.config.contracts.tokenBridgeRelayer as string;
    
    // Prepare the token details for transfer. Uncomment and change address for MapMetrics; currently trying to send native-dev sol to Moonbase
    const token = Wormhole.tokenId(sendChain.chain, "native");
    // const token = Wormhole.tokenId("Solana", MAPMETRICSADDRESS); // change to MapMetrics's contract address


    // get dev solana and moonbase alpha signers
    const source = await generateKeyPairSolana(sourceAddress);
    const destination = await getSignerEVM(destAddress);
    console.log('\nMocked source object\n', source);
    console.log('\nMocked destination object\n',destination);


    // Used to normalize the amount to account for the tokens decimals
    const decimals = isTokenId(token)
    ? Number(await wh.getDecimals(token.chain, token.address))
    : sendChain.config.nativeTokenDecimals;
    console.log('\nSolana token decimals: ', decimals);
    

    // TODO transfer devnet solana tokens to moonbeam
    // Must have create correct object to be passed (type SourceSigner<N, Chain> & type DestinationSigner<N, Chain>)
    //      Can ctrl+click on objects from wormhole sdk import above to see how they should be implemented
    // 
    // 1. Setup ChainAddress properly
    //  const chainAddress: ChainAddress = {
    //   chain: sendChain.chain,
    //   address: sendChain.config.contracts.tokenBridgeRelayer as string
    //  };
    // 2. Setup ChainContext properly
    // 3. Setup Signer properly
    // After implmenting all 3 types proeprly in the source abnd destination objects, then we can initiate a transder

    // 4. Check different chain address to see which bridges ensure proper transport


    // TODO look at sample repo: https://github.com/wormhole-foundation/wormhole-sdk-ts/blob/main/examples/src/tokenBridge.ts
    // to see how to transfer tokens
  }

main();