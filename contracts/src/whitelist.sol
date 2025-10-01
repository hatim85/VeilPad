// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract Whitelist is Ownable {
    // custom errors
    error Deadline_Reached();
    error Supporter_Limit_Reached();
    error Already_Registered();

    // events
    event Registered(uint256 indexed nullifier);

    // state variables
    string public NAME;
    string public SYMBOL;

    address private immutable i_tokenAddr;

    uint256 public immutable i_deadline;
    uint256 public immutable i_maxSupporters;

    uint256 public s_supporterCount;

    bytes32 private s_merkleRoot;

    mapping(uint256 nullifier => bool hasregistered) public s_registered;

    constructor(
        string memory _name,
        string memory _symbol,
        address _tokenAddr,
        uint256 _supportPeriod,
        uint256 _maxSupporters,
        address _owner
    ) Ownable(_owner) {
        NAME = _name;
        SYMBOL = _symbol;
        i_tokenAddr = _tokenAddr;
        i_deadline = block.timestamp + _supportPeriod;
        s_merkleRoot = bytes32("");
        i_maxSupporters = _maxSupporters;
        s_supporterCount = 0;
    }

    /**
     * @dev Registers a supporter
     * @param _nullifier Nullifier hash of the supporter, which is calculated by hashing the user's address hash with a secret string
     * NOTE: 1. The supporter can only register if the deadline has not been reached and the supporter limit has not been reached
     */
    function register(uint256 _nullifier) public returns (bool) {
        if (block.timestamp > i_deadline) revert Deadline_Reached();
        if (s_supporterCount == i_maxSupporters) {
            revert Supporter_Limit_Reached();
        }

        if (s_registered[_nullifier]) revert Already_Registered();
        s_registered[_nullifier] = true;
        s_supporterCount++;

        emit Registered(_nullifier);
        return true;
    }

    function getMaxSupporters() public view returns (uint256) {
        return i_maxSupporters;
    }
}
