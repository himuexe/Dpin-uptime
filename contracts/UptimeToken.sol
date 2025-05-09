// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title UptimeToken
 * @dev ERC20 token used for rewarding uptime monitoring validators
 */
contract UptimeToken is ERC20, Ownable {
    // Initial supply of 100 million tokens with 18 decimals
    uint256 private constant INITIAL_SUPPLY = 100_000_000 * 10**18;
    
    // Cap for maximum token supply
    uint256 private immutable _cap;
    
    /**
     * @dev Constructor that gives the msg.sender all existing tokens.
     */
    constructor() ERC20("Uptime Token", "UPT") Ownable(msg.sender) {
        _cap = INITIAL_SUPPLY * 2; // Cap at 200 million tokens
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Mint new tokens for rewards distribution
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= _cap, "UptimeToken: cap exceeded");
        _mint(to, amount);
    }
    
    /**
     * @dev Returns the cap on the token's total supply.
     */
    function cap() public view returns (uint256) {
        return _cap;
    }
} 