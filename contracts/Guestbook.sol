// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Guestbook {
    struct Message {
        address sender;
        string content;
        uint256 timestamp;
    }

    address public owner;
    Message[] public messages;

    event MessagePosted(address indexed sender, string content, uint256 timestamp);

    constructor() {
        owner = msg.sender;
    }

    function postMessage(string calldata _content) external payable {
        require(msg.value >= 0.001 ether, "Must send at least 0.001 ETH");
        require(bytes(_content).length > 0, "Message cannot be empty");

        messages.push(Message(msg.sender, _content, block.timestamp));
        emit MessagePosted(msg.sender, _content, block.timestamp);
    }

    function getMessages() external view returns (Message[] memory) {
        return messages;
    }

    function withdraw() external {
        require(msg.sender == owner, "Only owner can withdraw");
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }
}
