// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/token.sol";

contract DeployMockToken is Script {
    function run() external {
        vm.startBroadcast();
        new Token("MockToken", "MTK", 1_000_000 ether, msg.sender);
        vm.stopBroadcast();
    }
}