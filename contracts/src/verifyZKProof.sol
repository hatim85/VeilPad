// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VerifyZKProof {
    error Invalid_Proof();

    bytes32 public constant PROVING_SYSTEM_ID =
        keccak256(abi.encodePacked("groth16"));

    address public immutable zkvContract;

    event SuccessfulProofSubmission();

    constructor(address _zkvContract) {
        zkvContract = _zkvContract;
    }

    function verifyZKProof(
        uint256 attestationId,
        uint256 merkleRoot,
        bytes32[] calldata merklePath,
        uint256 leafCount,
        uint256 index,
        bytes32 vkHash
    ) external {
        bool valid = _verifyProofHasBeenPostedToZkv(
            attestationId,
            merkleRoot,
            merklePath,
            leafCount,
            index,
            vkHash
        );
        if (!valid) revert Invalid_Proof();
        emit SuccessfulProofSubmission();
    }

    function _verifyProofHasBeenPostedToZkv(
        uint256 attestationId,
        uint256 merkleRoot,
        bytes32[] calldata merklePath,
        uint256 leafCount,
        uint256 index,
        bytes32 vkHash
    ) internal view returns (bool) {
        bytes memory encodedInput = abi.encodePacked(
            _changeEndianess(uint256(merkleRoot))
        );
        bytes32 leaf = keccak256(
            abi.encodePacked(PROVING_SYSTEM_ID, vkHash, keccak256(encodedInput))
        );

        (bool callSuccessful, ) = zkvContract.staticcall(
            abi.encodeWithSignature(
                "verifyProofAttestation(uint256,bytes32,bytes32[],uint256,uint256)",
                attestationId,
                leaf,
                merklePath,
                leafCount,
                index
            )
        );

        if (!callSuccessful) revert Invalid_Proof();

        return callSuccessful;
    }

    function _changeEndianess(uint256 input) internal pure returns (uint256 v) {
        v = input;
        // swap bytes
        v =
            ((v &
                0xFF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00) >>
                8) |
            ((v &
                0x00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF) <<
                8);
        // swap 2-byte long pairs
        v =
            ((v &
                0xFFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000) >>
                16) |
            ((v &
                0x0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF) <<
                16);
        // swap 4-byte long pairs
        v =
            ((v &
                0xFFFFFFFF00000000FFFFFFFF00000000FFFFFFFF00000000FFFFFFFF00000000) >>
                32) |
            ((v &
                0x00000000FFFFFFFF00000000FFFFFFFF00000000FFFFFFFF00000000FFFFFFFF) <<
                32);
        // swap 8-byte long pairs
        v =
            ((v &
                0xFFFFFFFFFFFFFFFF0000000000000000FFFFFFFFFFFFFFFF0000000000000000) >>
                64) |
            ((v &
                0x0000000000000000FFFFFFFFFFFFFFFF0000000000000000FFFFFFFFFFFFFFFF) <<
                64);
        // swap 16-byte long pairs
        v = (v >> 128) | (v << 128);
    }
}
