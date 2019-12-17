pragma solidity ^0.5.0;

import "./SmartName.sol";
import "./SmartNameLibrary.sol";

/**
 * @title SmartNameRegistry
 * @author Steve Despres - @stevedespres - steve.despres@protonmail.com
 * @notice This contract represents a register of smart name. Users can register and manage smart names, with traditionnal domain name format ("name"."ext"), and associate a record to this smart name. The record is an ethereum address.
 * @dev The smart name format is composed by "name" (bytes16) and "extension" (bytes4). The smart names have id, which is a keccak256 hash avec the "name" and "extension".
 */
contract SmartNameRegistry{

    /**
     * @notice Mapping of address and SmartName
     */
    mapping (bytes32 => SmartName) public smartNames;

    /**
     * @notice Mapping of address and Administrator
     */
    mapping (address => Administrator) public administrators;

    /**
     * @notice Mapping of smart names ids and their index in wallet
     */
    mapping (bytes32 => uint) public indexes;

    /**
     * @notice Number of smart names registered
     */
    uint public nbSmartNamesTotal;

    /**
     * @notice Represents an Adminitrator of smart names
     */
    struct Administrator {
        address addr;
        bytes32[] wallet;
        uint nbSmartNames;
    }

    /**
     * @notice Log when a smart name is registered
     * @param id id of the smart name
     * @param smartName SmartName contract
     */
    event LogForCreation(bytes32 id, SmartName smartName);

    /**
     * @notice Log when the administrator of a smart name is updated
     * @param id id of the smart name
     * @param smartName SmartName contract
     */
    event LogForAdministratorUpdate(bytes32 id, SmartName smartName);

    /**
     * @notice Log when the record of a smart name is updated
     * @param id id of the smart name
     * @param smartName SmartName contract
     */
    event LogForRecordUpdate(bytes32 id, SmartName smartName);

    /**
     * @notice Log when a smart name is abandoned
     * @param id id of the smart name
     * @param smartName SmartName contract
     */
    event LogForAbandon(bytes32 id, SmartName smartName);

    /**
     * @notice Modifier to verify that the caller is the administrator of the smart name
     * @param _id id of the smart name
     */
    modifier isAdminOf(bytes32 _id)
    {
        require(msg.sender == smartNames[_id].getAdministrator(), "Error: Only the administrator is authorized");
        _;
    }

    /**
     * @notice Modifier to verify that the adress is an administrator
     * @param _address address
     */
    modifier isAdmin(address _address)
    {
        require(administrators[_address].addr != address(0x0), "Error: This address is not an administrator");
        _;
    }

    /**
     * @notice Modifier to verify that the smart name is registered
     * @param _id id of the smart name
     */
    modifier isRegistered(bytes32 _id)
    {
        require(smartNames[_id] != SmartName(0x0), "Error: The smart name is not registered");
        require(smartNames[_id].getAdministrator() != address(0x0), "Error: The smart name is not registered");
        _;
    }

    /**
     * @notice Modifier to verify that the smart name is not registered
     * @param _name name
     * @param _ext extension
     */
    modifier isNotRegistered(bytes16 _name, bytes4 _ext)
    {
        bytes32 id = SmartNameLibrary.getIdOf(_name, _ext);
        require((smartNames[id] == SmartName(0x0) || smartNames[id].getAdministrator() == address(0x0)),
        "Error: The smart name is not registered");

        _;
    }

    /**
     * @notice Register a smart name
     * @param _name name
     * @param _ext extension
     * @return Id and SmartName contract
     */
    function register(bytes16 _name, bytes4 _ext) public
        isNotRegistered(_name, _ext) returns(bytes32, SmartName)
    {
        bytes32 id = SmartNameLibrary.getIdOf(_name, _ext);

        // Create smart name
        registerSmartName(id, _name, _ext);
        nbSmartNamesTotal++;

        // Update Administrator
        administrators[msg.sender].addr = msg.sender;
        administrators[msg.sender].wallet.push(id);
        administrators[msg.sender].nbSmartNames++;

        // Update index in the wallet
        indexes[id] = administrators[msg.sender].nbSmartNames-1;

        emit LogForCreation(id, smartNames[id]);
        return (id, smartNames[id]);
    }

    /**
     * @notice Abandon a smart name
     * @param _id id of the smart name
     */
    function abandon(bytes32 _id) public
            isRegistered(_id) isAdminOf(_id)
    {
        // Delete smart name
        abandonSmartName(smartNames[_id]);
        nbSmartNamesTotal--;

        // Update Administrator
        administrators[msg.sender].nbSmartNames--;
        delete administrators[msg.sender].wallet[indexes[_id]];
        if(administrators[msg.sender].nbSmartNames==0) {
            delete administrators[msg.sender];
        }

        // Update index in the wallet
        delete indexes[_id];

        emit LogForAbandon(_id, smartNames[_id]);
    }

   /**
     * @notice Modify the administrator of a smart name
     * @param _id id of the smart name
     * @param _newAdministrator new administrator
     * @return Id and SmartName contract
     */
    function modifyAdministrator(bytes32 _id, address _newAdministrator) public
        isRegistered(_id) isAdminOf(_id) returns(bytes32, SmartName)
    {
        require(msg.sender != _newAdministrator, "Error : This address is already administrator of this smart name");

        // Update old administrator
        administrators[msg.sender].nbSmartNames--;
        delete administrators[msg.sender].wallet[indexes[_id]];
        if(administrators[msg.sender].nbSmartNames==0){
            delete administrators[msg.sender];
        }

        // Update new Administrator
        administrators[_newAdministrator].addr = _newAdministrator;
        administrators[_newAdministrator].wallet.push(_id);
        administrators[_newAdministrator].nbSmartNames++;

        // Update smart name
        smartNames[_id].setAdministrator(_newAdministrator);
        smartNames[_id].setRecord(_newAdministrator);

        // Update index in the wallet
        indexes[_id] = administrators[_newAdministrator].nbSmartNames-1;

        emit LogForAdministratorUpdate(_id, smartNames[_id]);
        return (_id, smartNames[_id]);
    }

    /**
     * @notice Modify the record of a smart name
     * @param _id id of the smart name
     * @param _newRecord new record
     * @return SmartNameContract
     */
    function modifyRecord(bytes32 _id, address _newRecord) public
        isRegistered(_id) isAdminOf(_id) returns (bytes32, SmartName)
    {
        require(smartNames[_id].getRecord() != _newRecord, "Error : This record is already associate to this smart name");

        // Update record
        smartNames[_id].setRecord(_newRecord);

        emit LogForRecordUpdate(_id, smartNames[_id]);
        return (_id, smartNames[_id]);
    }

    /**
     * @notice Get smart name by id
     * @param _id id of a smart name
     * @return Id, SmartNameContract, name, extension, administrator, record
     */
    function getSmartName(bytes32 _id) public view
        isRegistered(_id) returns (bytes32, SmartName, bytes16, bytes4, address, address)
    {
        return (
            _id,
            smartNames[_id],
            smartNames[_id].getName(),
            smartNames[_id].getExtension(),
            smartNames[_id].getAdministrator(),
            smartNames[_id].getRecord()
        );
    }

    /**
     * @notice Get Administrator from the caller
     * @return address, number of smart names, wallet
     */
    function getAdministrator() public view
        returns (address, uint, bytes32[] memory)
    {
        return getAdministratorByAddress(msg.sender);
    }

    /**
     * @notice Get Administrator of a smart name
     * @param _id id of a smart name
     * @return address, number of smart names, wallet
     */
    function getAdministratorOf(bytes32 _id) public view
        isRegistered(_id) returns (address, uint, bytes32[] memory)
    {
        address adminAddress = smartNames[_id].getAdministrator();
        return getAdministratorByAddress(adminAddress);
    }

    /**
     * @notice Get Administrator by Address
     * @param _address address
     * @return address, number of smart names, wallet
     */
    function getAdministratorByAddress(address _address) public view
        isAdmin(_address) returns (address, uint, bytes32[] memory)
    {
        Administrator memory admin = administrators[_address];
        return(admin.addr, admin.nbSmartNames, admin.wallet);
    }

    /**
     * @notice Get number of smart names
     * @return number of smart names
     */
    function getNbSmartNamesTotal() public view
        returns (uint)
    {
        return nbSmartNamesTotal;
    }

    /**
     * @notice Get id by name and extension
     * @return id
     */
    function getIdOf(bytes16 _name, bytes4 _ext) public pure
        returns (bytes32)
    {
        return SmartNameLibrary.getIdOf(_name, _ext);
    }

    /**
     * @notice Reset the smart name. The contract is not deleted but the administrator and the record are reset to address(0x0)
     */
    function abandonSmartName(SmartName smartName) private
    {
        smartName.setAdministrator(address(0x0));
        smartName.setRecord(address(0x0));
    }

    /**
     * @notice Register the smart name. The administrator and the record of the smart name are set up.
     */
    function registerSmartName(bytes32 _id, bytes16 _name, bytes4 _ext) private
    {
        if(smartNames[_id] == SmartName(0x0)) {
            smartNames[_id] = new SmartName(_id, _name, _ext, msg.sender, msg.sender);
        } else {
            smartNames[_id].setAdministrator(msg.sender);
            smartNames[_id].setRecord(msg.sender);
        }
    }
}