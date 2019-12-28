pragma solidity ^0.5.0;

/**
 * @title SmartNameLibrary
 * @author Steve Despres - @stevedespres - steve.despres@protonmail.com
 * @notice This library provide some tools that can be used by other contracts
 */
library SmartNameLibrary {

    /**
     * @notice Get id by name and extension
     * @param _name name
     * @param _ext extension
     * @return id
     */
    function getIdOf(bytes16 _name, bytes4 _ext) public pure returns(bytes32) {
        return keccak256(abi.encodePacked(_name, _ext));
    }
}