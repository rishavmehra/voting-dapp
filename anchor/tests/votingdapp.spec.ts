import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import { BankrunProvider, startAnchor } from "anchor-bankrun";
import {Keypair, PublicKey} from '@solana/web3.js'
import {Votingdapp} from '../target/types/votingdapp'

const IDL = require('../target/idl/votingdapp.json')

const votingdappAddress = new PublicKey("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF")


describe('votingdapp', () => {

  it('Initialize poll', async () => {
    const context = await startAnchor("", [{name:"votingdapp", programId: votingdappAddress }], []);
    const provider = new BankrunProvider(context);
    
    const votingdappProgram = new Program<Votingdapp>(
      IDL,
      provider,
    );  

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

    // console.log("this is the best", [new anchor.BN(5).toArrayLike(Buffer, "le", 8)]);
    

    // console.log(polladdress);
    

    const poll = await votingdappProgram.account.poll.fetch(polladdress);

  //  console.log(poll);


    expect(poll.pollId.toNumber()).toEqual(5)
    expect(poll.description).toEqual("what is you favorite type of peaunt buffer?")
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber())
    expect(poll.pollEnd.toNumber()).toEqual(1833923812)
    expect(poll.candidateAmount.toNumber()).toEqual(0)
  })

})
