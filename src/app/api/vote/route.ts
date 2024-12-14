
import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions"
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Votingdapp } from "@/../anchor/target/types/votingdapp"
import { BN, Program } from "@coral-xyz/anchor";

const IDL = require("@/../anchor/target/idl/votingdapp.json")

export const OPTIONS = GET;

export async function GET(request: Request) {
  const actionMetadata: ActionGetResponse = {
    icon:"https://m.media-amazon.com/images/I/41CMqFys1xL._SX300_SY300_QL70_FMwebp_.jpg",
    title:"vote for peaunt butter",
    description:"vote for our favourite peaunt buttfer smooth and crunchy",
    label:"Vote",
    links: {
      actions: [
        // @ts-ignore
        {
         label: "crunchy", 
         href: "/api/vote?candidate=crunchy",
         type: "transaction"
        },
        // @ts-ignore
        {
          label: "smooth", 
          href: "/api/vote?candidate=smooth",
          type:"transaction"
        },
      ]
    }
  };
  
  return Response.json(actionMetadata, { headers:ACTIONS_CORS_HEADERS });
}


export async function POST(request: Request) {
  const url = new URL(request.url)
  const candidate = url.searchParams.get("candidate")

  if (candidate != "smooth" && candidate != "crunchy"){
    return new Response("Invalid Candidate", {status:400, headers: ACTIONS_CORS_HEADERS});
  }

  const connection =  new Connection("https://api.devnet.solana.com/", "confirmed")
  const program: Program<Votingdapp> = new Program(IDL, {connection} )
  const body: ActionPostRequest = await request.json();
  let voter;

  try{
    voter = new PublicKey(body.account)
  }catch(error){
    return new Response("Invalid account", {status:400, headers: ACTIONS_CORS_HEADERS});

  }

  const instruction = await program.methods
  .initializeVote(candidate, new BN(1))
  .accounts({
    signer:voter
  })
  .instruction()

  const blockhash = await connection.getLatestBlockhash();
  const transaction =  new Transaction({
    feePayer: voter,
    blockhash: blockhash.blockhash,
    lastValidBlockHeight: blockhash.lastValidBlockHeight
  // @ts-ignore
  }).add(instruction);

  const response = await createPostResponse({
    // @ts-ignore
    fields:{
      transaction:transaction
    }
  });

  return Response.json(response, {headers: ACTIONS_CORS_HEADERS})
}

