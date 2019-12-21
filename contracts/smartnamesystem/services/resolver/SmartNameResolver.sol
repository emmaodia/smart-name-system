pragma solidity ^0.5.0;

import "../../registry/SmartName.sol";
import "../SmartNameService.sol";

/**
 * @title SmartNameResolver
 * @author Steve Despres - @stevedespres - steve.despres@protonmail.com
 * @notice This contract represents a resolver of smart name. It can be used to resolve smart names and get informations about
 */
contract SmartNameResolver is SmartNameService {

   /**
     * @notice Constructor of a Smart name resolver
     * @param _smartNameRegistryAddress SmartNameRegistry address
     */
    constructor(address _smartNameRegistryAddress) SmartNameService(_smartNameRegistryAddress) public
    {}

     /**
     * @notice Resolve a smart name
     * @param _name name
     * @param _ext extension
     * @return address of the record
     */
    function resolve(bytes16 _name, bytes4 _ext) public view
        returns (address)
    {
        bytes32 id = smartNameRegistry.getIdOf(_name, _ext);
        (, , , , ,address record) = smartNameRegistry.getSmartName(id);
        return record;
    }

    /**
     * @notice Get the administrator of a smart name
     * @param _name name
     * @param _ext extension
     * @return address of the administrator
     */
    function whois(bytes16 _name, bytes4 _ext) public view
        returns (address)
    {
        bytes32 id = smartNameRegistry.getIdOf(_name, _ext);
        (, , , , address administrator, ) = smartNameRegistry.getSmartName(id);
        return administrator;
    }

    /**
     * @notice Get a smart name
     * @param _name name
     * @param _ext extension
     * @return address of the smart name contract
     */
    function get(bytes16 _name, bytes4 _ext) public view
        returns (SmartName)
    {
        bytes32 id = smartNameRegistry.getIdOf(_name, _ext);
        (,SmartName smartName, , , , ) = smartNameRegistry.getSmartName(id);
        return smartName;
    }
}