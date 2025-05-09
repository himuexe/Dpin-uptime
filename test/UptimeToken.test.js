const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UptimeToken", function () {
  let UptimeToken;
  let uptimeToken;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get contract factories
    UptimeToken = await ethers.getContractFactory("UptimeToken");
    
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy contracts
    uptimeToken = await UptimeToken.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await uptimeToken.owner()).to.equal(owner.address);
    });

    it("Should assign the initial supply to the owner", async function () {
      const ownerBalance = await uptimeToken.balanceOf(owner.address);
      expect(await uptimeToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      await uptimeToken.transfer(addr1.address, 50);
      const addr1Balance = await uptimeToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      await uptimeToken.connect(addr1).transfer(addr2.address, 25);
      const addr2Balance = await uptimeToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(25);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await uptimeToken.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner
      await expect(
        uptimeToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      // Owner balance shouldn't have changed
      expect(await uptimeToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const initialTotalSupply = await uptimeToken.totalSupply();
      const mintAmount = 1000;

      await uptimeToken.mint(addr1.address, mintAmount);
      
      // Check addr1 balance increased
      expect(await uptimeToken.balanceOf(addr1.address)).to.equal(mintAmount);
      
      // Check total supply increased
      expect(await uptimeToken.totalSupply()).to.equal(
        initialTotalSupply.add(mintAmount)
      );
    });

    it("Should not allow non-owner to mint tokens", async function () {
      await expect(
        uptimeToken.connect(addr1).mint(addr2.address, 1000)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Cap", function () {
    it("Should enforce the max cap", async function () {
      const cap = await uptimeToken.cap();
      const totalSupply = await uptimeToken.totalSupply();
      const mintableAmount = cap.sub(totalSupply);
      
      // Mint up to the cap
      await uptimeToken.mint(owner.address, mintableAmount);
      
      // Try to mint 1 more token, should fail
      await expect(
        uptimeToken.mint(owner.address, 1)
      ).to.be.revertedWith("UptimeToken: cap exceeded");
    });
  });
}); 