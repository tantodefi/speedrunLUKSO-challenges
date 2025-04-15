pragma solidity 0.8.9; //Do not change the solidity version as it negativly impacts submission grading
// SPDX-License-Identifier: MIT

import "./YourLSP7Token.sol";

contract Vendor {
  event BuyTokens(address buyer, uint256 amountOfETH, uint256 amountOfTokens);
  event SellTokens(address seller, uint256 amountOfTokens, uint256 amountOfETH);

  YourLSP7Token public yourToken;
  address private owner;
  
  // Token price set to 0.001 ETH
  uint256 public constant tokensPerEth = 1000;
  
  modifier onlyOwner() {
    require(msg.sender == owner, "Not the owner");
    _;
  }

  constructor(address tokenAddress) {
    yourToken = YourLSP7Token(tokenAddress);
    owner = msg.sender;
  }

  // Function to buy tokens from the vendor
  function buyTokens() public payable {
    require(msg.value > 0, "Send ETH to buy tokens");
    
    uint256 amountOfTokens = msg.value * tokensPerEth;
    
    // Check if the vendor has enough tokens
    uint256 vendorBalance = yourToken.balanceOf(address(this));
    require(vendorBalance >= amountOfTokens, "Vendor has insufficient tokens");
    
    // Transfer tokens to the buyer using LSP7 transfer
    yourToken.transfer(address(this), msg.sender, amountOfTokens, true, "");
    
    emit BuyTokens(msg.sender, msg.value, amountOfTokens);
  }

  // Function to withdraw ETH from the contract (only owner)
  function withdraw() public onlyOwner {
    uint256 balance = address(this).balance;
    require(balance > 0, "No ETH to withdraw");
    
    (bool sent, ) = payable(owner).call{value: balance}("");
    require(sent, "Failed to withdraw ETH");
  }

  // Function to sell tokens back to the vendor
  function sellTokens(uint256 tokenAmount) public {
    require(tokenAmount > 0, "Must sell at least one token");
    
    // Check if the sender has enough tokens
    uint256 userTokens = yourToken.balanceOf(msg.sender);
    require(userTokens >= tokenAmount, "Insufficient tokens");
    
    // Calculate ETH amount based on token price
    uint256 ethAmount = tokenAmount / tokensPerEth;
    require(address(this).balance >= ethAmount, "Vendor has insufficient ETH");
    
    // Important: User must first authorize this contract to transfer tokens
    // User should call: yourToken.authorizeOperator(vendorAddress, amount)
    
    // Transfer tokens from the seller to the vendor using LSP7 transferFrom
    yourToken.transferFrom(msg.sender, address(this), tokenAmount, true, "");
    
    // Transfer ETH to the seller
    (bool ethSent, ) = payable(msg.sender).call{value: ethAmount}("");
    require(ethSent, "Failed to send ETH to seller");
    
    emit SellTokens(msg.sender, tokenAmount, ethAmount);
  }
}
