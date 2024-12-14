
import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS } from "@solana/actions"
import { Connection, PublicKey } from "@solana/web3.js";
import { Votingdapp } from "@/../anchor/target/types/votingdapp"
import { BN, Program } from "@coral-xyz/anchor";

const IDL = require("@/../anchor/target/idl/votingdapp.json")


export const OPTIONS = GET;

export async function GET(request: Request) {
  const actionMetadata: ActionGetResponse = {
    icon:"",
    title:"vote for peaunt butter",
    description:"vote for our favouret peaunt buttfer smooth and crunchy",
    label:"Vote",
    links: {
      actions: [
        {
         label: "vote for crunchy", 
         href: "/api/vote?candidate=crunchy",
         type:"post",
        },
        {
          label: "vote for smooth", 
          href: "/api/vote?candidate=smooth",
          type:"post",
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
  .instruction
}
