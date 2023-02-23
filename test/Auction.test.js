const Auction = artifacts.require("Auction");

contract("Auction", async accounts => {
    let auction;
    const ownerAccount = accounts[0];
    const userAccountOne = accounts[1];
    const userAccountTwo = accounts[2];

    const amount = 5000000000000000000; // 5 ETH
    const smallAmount = 3000000000000000000; // 3 ETH

    
 beforeEach(async () => {
    auction = await Auction.new({from: ownerAccount});
  })
 
  it("should make bid.", async () => {
    await auction.makeBid({value: amount, from: userAccountOne});
    const bidAmount = await auction.bids(userAccountOne);
    assert.equal(bidAmount, amount)
  });
 
  it("should reject owner's bid.", async () => {
    try {
      await auction.makeBid({value: amount, from: ownerAccount});
    } catch (e) {
      assert.include(e.message, "Owner is not allowed to bid.")
    }
  });
 
  it("should require higher bid amount.", async () => {
    try {
      await auction.makeBid({value: amount, from: userAccountOne});
      await auction.makeBid({value: smallAmount, from: userAccountTwo});
    } catch (e) {
      assert.include(e.message, "Bid error: Make a higher Bid.")
    }
  });
 
 
  it("should fetch highest bid.", async () => {
    await auction.makeBid({value: amount, from: userAccountOne});
    const highestBid = await auction.fetchHighestBid();
    assert.equal(highestBid.bidAmount, amount)
    assert.equal(highestBid.bidder, userAccountOne)
  });
 
  it("should fetch owner.", async () => {
    const owner = await auction.getOwner();
    assert.equal(owner, ownerAccount)
  });
 
 })