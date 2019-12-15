pragma solidity ^0.5.0;

import "@openzeppelin/contracts/ownership/Secondary.sol";

/**
 * @title SmartName
 * @author Steve Despres - @stevedespres - steve.despres@protonmail.com
 * @notice This contract represents a smart name. It is composed of an id, a name, an extension, an administrator and a record. It is owned by a it's creator, which is a registry. The administrator must use the registry contract to manage his smart name.
 */
contract SmartName is Secondary {

    /**
     * @notice Id
     */
    bytes32 public id;

    /**
     * @notice Name
     */
    bytes16 public name;

    /**
     * @notice Extension
     */
    bytes4 public ext;

    /**
     * @notice Administrator
     */
    address public administrator;

    /**
     * @notice Record
     */
    address public record;

    /**
     * @notice Log when a smart name is created
     * @param id id of the smart name
     */
    event LogForCreation(bytes32 id);

    /**
     * @notice Log when the administrator of a smart name is updated
     * @param id id of the smart name
     */
    event LogForAdministratorUpdate(bytes32 id);

    /**
     * @notice Log when the record of a smart name is updated
     * @param id id of the smart name
     */
    event LogForRecordUpdate(bytes32 id);

    /**
     * @notice Modifier to verify that the name and the extension are not empty
     * @param _name name
     * @param _ext extension
     */
    modifier smartNameNotEmpty(bytes16 _name, bytes4 _ext)
    {
            require(_name[0] != 0, "Error: The name is empty");
            require(_ext[0] != 0, "Error: The extension is empty");
        _;
    }

    /**
     * @notice Modifier to verify that the address is not empty
     * @param _address address
     */
    modifier addressNotEmpty(address _address)
    {
        require(_address != address(0x0), "Error: The address is empty");
        _;
    }

    /**
     * @notice Constructor of a smart name
     * @param _id id
     * @param _name name
     * @param _ext extension
     * @param _administrator administrator
     * @param _record record
     */
    constructor(bytes32 _id, bytes16 _name, bytes4 _ext, address _administrator, address _record) public
        smartNameNotEmpty(_name, _ext) addressNotEmpty(_administrator) addressNotEmpty(_record)
    {
        id = _id;
        name = _name;
        ext = _ext;
        administrator = _administrator;
        record = _record;
        emit LogForCreation(id);
    }

    /**
     * @notice Set the administrator
     * @param _administrator new administrator
     */
    function setAdministrator(address _administrator) public
        onlyPrimary() addressNotEmpty(_administrator)
    {
        administrator = _administrator;
        emit LogForAdministratorUpdate(id);
    }

    /**
     * @notice Set the record
     * @param _record new administrator
     */
    function setRecord(address _record) public
        onlyPrimary() addressNotEmpty(_record)
    {
        record = _record;
        emit LogForRecordUpdate(id);
    }

    /**
     * @notice Get the smart name
     * @return id, name, extension, administrator, record
     */
    function get() public view
        returns (bytes32, bytes16, bytes4, address, address)
    {
        return (id, name, ext, administrator, record);
    }

    /**
     * @notice Get the id
     * @return id
     */
    function getId() public view
        returns (bytes32)
    {
        return id;
    }

    /**
     * @notice Get the name
     * @return name
     */
    function getName() public view
        returns (bytes16)
    {
        return name;
    }

    /**
     * @notice Get the extension
     * @return extension
     */
    function getExtension() public view
        returns (bytes4)
    {
        return ext;
    }

    /**
     * @notice Get the administrator
     * @return administrator
     */
    function getAdministrator() public view
        returns (address)
    {
        return administrator;
    }

    /**
     * @notice Get the record
     * @return record
     */
    function getRecord() public view
        returns (address)
    {
        return record;
    }
}