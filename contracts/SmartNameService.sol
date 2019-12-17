pragma solidity ^0.5.0;

import "./SmartNameRegistry.sol";

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
     * @param _smartNameRegistry SmartNameRegistry
     */
    constructor(SmartNameRegistry _smartNameRegistry) internal
    {
        smartNameRegistry = _smartNameRegistry;
        emit LogForServiceCreation();
    }
}