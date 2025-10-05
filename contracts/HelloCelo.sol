// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title HelloCelo - simple message board on Celo blockchain
contract HelloCelo {
    struct Message {
        address sender;
        string content;
        uint256 timestamp;
    }

    Message[] private messages;

    event MessageSent(address indexed sender, string content, uint256 timestamp);

    /// @notice Send a message to the blockchain
    /// @param _content The text of the message
    function sendMessage(string calldata _content) external {
        require(bytes(_content).length > 0, "Message cannot be empty");
        require(bytes(_content).length <= 280, "Message too long");

        messages.push(Message(msg.sender, _content, block.timestamp));
        emit MessageSent(msg.sender, _content, block.timestamp);
    }

    /// @notice Returns all messages
    function getAllMessages() external view returns (Message[] memory) {
        return messages;
    }

    /// @notice Returns the total number of messages
    function getMessageCount() external view returns (uint256) {
        return messages.length;
    }
}
