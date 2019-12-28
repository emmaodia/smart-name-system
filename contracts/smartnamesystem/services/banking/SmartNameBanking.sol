pragma solidity ^0.5.0;

import "../../registry/SmartName.sol";
import "../SmartNameService.sol";

import "@openzeppelin/contracts/payment/PullPayment.sol";

/**
 * @title SmartNameBanking
 * @author Steve Despres - @stevedespres - steve.despres@protonmail.com
 * @notice This contract represents a banking service using smart names. It permites to send ether to smart names
 */
contract SmartNameBanking is SmartNameService, PullPayment {

   /**
     * @notice Constructor of a Smart name banking
     * @param _smartNameRegistryAddress SmartNameRegistry address
     */
    constructor(address _smartNameRegistryAddress) SmartNameService(_smartNameRegistryAddress) public
    {}

     /**
     * @notice Send ether to a smart name
     * @param _name name
     * @param _ext extension
     */
    function send(bytes16 _name, bytes4 _ext) public payable
    {
        bytes32 id = smartNameRegistry.getIdOf(_name, _ext);
        sendById(id);
    }

     /**
     * @notice Send ether to a smart name by id
     * @param _id name
     */
    function sendById(bytes32 _id) public payable
    {
        (, , , , ,address record) = smartNameRegistry.getSmartName(_id);
        _asyncTransfer(record, msg.value);
    }
}