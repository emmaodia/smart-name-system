pragma solidity ^0.5.0;

import "../registry/SmartNameRegistry.sol";

/**
 * @title SmartNameService
 * @author Steve Despres - @stevedespres - steve.despres@protonmail.com
 * @notice This contract represents a smart name service. It must be overrided by anothers childs contracts
 */
contract SmartNameService{

    /**
     * @notice Extension
     */
    SmartNameRegistry public smartNameRegistry;

    /**
     * @notice Log when a smart name service is created
     */
    event LogForServiceCreation();

    /**
     * @notice Constructor of a Smart name service
     * @param _smartNameRegistryAddress SmartNameRegistry address
     */
    constructor(address _smartNameRegistryAddress) internal
    {
        smartNameRegistry = SmartNameRegistry(_smartNameRegistryAddress);
        emit LogForServiceCreation();
    }
}