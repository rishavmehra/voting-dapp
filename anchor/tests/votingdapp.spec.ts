import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import { BankrunProvider, startAnchor } from "anchor-bankrun";
import {Keypair, PublicKey} from '@solana/web3.js'
import {Votingdapp} from '../target/types/votingdapp'

const IDL = require('../target/idl/votingdapp.json')

const votingdappAddress = new PublicKey("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF")


describe('votingdapp', () => {

  let context;
  let provider;
  // @ts-ignore
  let votingdappProgram;

  beforeAll(async()=>{
    context = await startAnchor("", [{name:"votingdapp", programId: votingdappAddress }], []);
    provider = new BankrunProvider(context);
    
    votingdappProgram = new Program<Votingdapp>(
      IDL,
      provider,
    );

  })

  it('Initialize poll', async () => {
  // @ts-ignore    
    await votingdappProgram.methods.initializePool(
      new anchor.BN(5),
      "what is you favorite type of peaunt buffer?",
      new anchor.BN(0),
      new anchor.BN(1833923812),
    ).rpc();

    const [polladdress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(5).toArrayLike(Buffer, "le", 8)],
      votingdappAddress
    )

      // @ts-ignore
    const poll = await votingdappProgram.account.poll.fetch(polladdress);
    expect(poll.pollId.toNumber()).toEqual(5)
    expect(poll.description).toEqual("what is you favorite type of peaunt buffer?")
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber())
    expect(poll.pollEnd.toNumber()).toEqual(1833923812)
    expect(poll.candidateAmount.toNumber()).toEqual(0)
  });

  it('initialize candidate', async()=>{
      // @ts-ignore
    await votingdappProgram.methods.initializeCandidate(
      "peaunt butter smooth",
      new anchor.BN(5)
    ).rpc();
    // @ts-ignore
    await votingdappProgram.methods.initializeCandidate(
      "peaunt butter crunchy",
      new anchor.BN(5)
    ).rpc();

    const [smoothAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(5).toArrayLike(Buffer, "le", 8), Buffer.from("peaunt butter smooth")],
      votingdappAddress
    )

    // @ts-ignore
    const smoothCandidate = await votingdappProgram.account.candidate.fetch(smoothAddress);
    expect(smoothCandidate.candidateVotes.toNumber()).toEqual(0)

    const [crunchyAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(5).toArrayLike(Buffer, "le", 8), Buffer.from("peaunt butter crunchy")],
      votingdappAddress
    )  

    // @ts-ignore
    const crunchyCandidate = await votingdappProgram.account.candidate.fetch(crunchyAddress);
    expect(crunchyCandidate.candidateVotes.toNumber()).toEqual(0)
  });

  it("Voting", async()=>{
    // @ts-ignore
    await votingdappProgram.methods.initializeVote(
      "peaunt butter crunchy",
      new anchor.BN(5)
    ).rpc();

    const [crunchyAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(5).toArrayLike(Buffer, "le", 8), Buffer.from("peaunt butter crunchy")],
      votingdappAddress
    )

    // @ts-ignore
    const crunchyCandidate = await votingdappProgram.account.candidate.fetch(crunchyAddress);
    console.log(crunchyCandidate);
    expect(crunchyCandidate.candidateVotes.toNumber()).toEqual(1);
  })
})
