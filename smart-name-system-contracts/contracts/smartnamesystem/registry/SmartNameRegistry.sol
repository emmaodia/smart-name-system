pragma solidity ^0.5.0;

import "./SmartName.sol";
import "../utils/SmartNameLibrary.sol";

import "@openzeppelin/contracts/lifecycle/Pausable.sol";

/**
 * @title SmartNameRegistry
 * @author Steve Despres - @stevedespres - steve.despres@protonmail.com
 * @notice This contract represents a register of smart name. Users can register and manage smart names, with traditionnal domain name format ("name"."ext"), and associate a record to this smart name. The record is an ethereum address.
 * @dev The smart name format is composed by "name" (bytes16) and "extension" (bytes4). The smart names have id, which is a keccak256 hash avec the "name" and "extension".
 */
contract SmartNameRegistry is Pausable {

    /**
     * @notice Mapping of id and SmartName
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
     * @notice Mapping of smart names ids and their unlockers
     */
    mapping (bytes32 => bytes32) private unlockers;

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
    event LogForRegisterByRegistry(bytes32 id, SmartName smartName);

    /**
     * @notice Log when the administrator of a smart name is updated
     * @param id id of the smart name
     * @param smartName SmartName contract
     */
    event LogForAdministratorUpdateByRegistry(bytes32 id, SmartName smartName);

    /**
     * @notice Log when the record of a smart name is updated
     * @param id id of the smart name
     * @param smartName SmartName contract
     */
    event LogForRecordUpdateByRegistry(bytes32 id, SmartName smartName);

    /**
     * @notice Log when a smart name is abandoned
     * @param id id of the smart name
     * @param smartName SmartName contract
     */
    event LogForAbandonByRegistry(bytes32 id, SmartName smartName);

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
     * @notice Modifier to verify the unlocker of the smart name
     * @param _id id of the smart name
     * @param _unlocker id of the smart name
     */
    modifier isUnlockerOf(bytes32 _id, bytes32 _unlocker)
    {
        require(isUnlocker(_id, _unlocker), "Error: The unlocker for this smart name is not correct");
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
        indexes[id] = administrators[msg.sender].wallet.length-1;

        emit LogForRegisterByRegistry(id, smartNames[id]);
        return (id, smartNames[id]);
    }


    /**
     * @notice Abandon a smart name
     * @param _id id of the smart name
     */
    function abandon(bytes32 _id) public
        isAdminOf(_id)
    {
        return abandonSmartName(_id);
    }

    /**
     * @notice Abandon a smart name with Unlocker
     * @param _id id of the smart name
     * @param _unlocker unlocker of the smart name
     */
    function abandonWithUnlocker(bytes32 _id, bytes32 _unlocker) public
        isUnlockerOf(_id, _unlocker)
    {
        return abandonSmartName(_id);
    }

    /**
     * @notice Abandon a smart name
     * @param _id id of the smart name
     */
    function abandonSmartName(bytes32 _id) private
        isRegistered(_id)
    {
        address administrator = smartNames[_id].getAdministrator();

        // Delete smart name
        abandonSmartName(smartNames[_id]);
        nbSmartNamesTotal--;

        // Update Administrator
        administrators[administrator].nbSmartNames--;
        delete administrators[administrator].wallet[indexes[_id]];
        if(administrators[administrator].nbSmartNames == 0) {
            delete administrators[administrator];
        }

        // Update index in the wallet
        delete indexes[_id];

        // Delete unlocker
        delete unlockers[_id];

        emit LogForAbandonByRegistry(_id, smartNames[_id]);
    }

    /**
     * @notice Modifiy the administrator of a smart name
     * @param _id id of the smart name
     * @param _newAdministrator new administrator
     * @return Id and SmartName contract
     */
    function modifyAdministrator(bytes32 _id, address _newAdministrator) public
        isAdminOf(_id) returns(bytes32, SmartName)
    {
        return modifyAdministratorOfSmartName(_id, _newAdministrator);
    }

    /**
     * @notice Modifiy the administrator of a smart name with Unlocker
     * @param _id id of the smart name
     * @param _newAdministrator new administrator
     * @param _unlocker unlocker of the smart name
     * @return Id and SmartName contract
     */
    function modifyAdministratorWithUnlocker(bytes32 _id, address _newAdministrator, bytes32 _unlocker) public
        isUnlockerOf(_id, _unlocker) returns(bytes32, SmartName)
    {
        return modifyAdministratorOfSmartName(_id, _newAdministrator);
    }

   /**
     * @notice Modify the administrator of a smart name
     * @param _id id of the smart name
     * @param _newAdministrator new administrator
     * @return Id and SmartName contract
     */
    function modifyAdministratorOfSmartName(bytes32 _id, address _newAdministrator) private
        isRegistered(_id) returns(bytes32, SmartName)
    {
        address oldAdministrator = smartNames[_id].getAdministrator();
        require(oldAdministrator != _newAdministrator, "Error : This address is already administrator of this smart name");

        // Update old administrator
        administrators[oldAdministrator].nbSmartNames--;
        delete administrators[oldAdministrator].wallet[indexes[_id]];
        if(administrators[oldAdministrator].nbSmartNames==0){
            delete administrators[oldAdministrator];
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

        // Delete unlocker
        delete unlockers[_id];

        emit LogForAdministratorUpdateByRegistry(_id, smartNames[_id]);
        return (_id, smartNames[_id]);
    }

    /**
     * @notice Modify the record of a smart name
     * @param _id id of the smart name
     * @param _newRecord new record
     * @return SmartNameContract
     */
    function modifyRecord(bytes32 _id, address _newRecord) public
        isAdminOf(_id) returns (bytes32, SmartName)
    {
        return modifyRecordOfSmartName(_id, _newRecord);
    }

    /**
     * @notice Modify the record of a smart name with unlocker
     * @param _id id of the smart name
     * @param _newRecord new record
     * @param _unlocker unlocker of the smart name
     * @return SmartNameContract
     */
    function modifyRecordWithUnlocker(bytes32 _id, address _newRecord, bytes32 _unlocker) public
        isUnlockerOf(_id, _unlocker) returns (bytes32, SmartName)
    {
        return modifyRecordOfSmartName(_id, _newRecord);
    }

    /**
     * @notice Modify the record of a smart name
     * @param _id id of the smart name
     * @param _newRecord new record
     * @return SmartNameContract
     */
    function modifyRecordOfSmartName(bytes32 _id, address _newRecord) private
        isRegistered(_id) returns (bytes32, SmartName)
    {
        require(smartNames[_id].getRecord() != _newRecord, "Error : This record is already associate to this smart name");

        // Update record
        smartNames[_id].setRecord(_newRecord);

        emit LogForRecordUpdateByRegistry(_id, smartNames[_id]);
        return (_id, smartNames[_id]);
    }

    /**
     * @notice Set an unlocker for a smart name. An unlocker is a code that permit to manage a domain name not being the administrator.
     * @param _id id of the smart name
     * @param _unlocker unlocker of the smart name
     */
    function setUnlocker(bytes32 _id, bytes32 _unlocker) public
        isAdminOf(_id)
    {
        unlockers[_id] = keccak256(abi.encodePacked(_unlocker));
    }

    /**
     * @notice Remove the unlocker of a smart name
     * @param _id id of the smart name
     */
    function removeUnlocker(bytes32 _id) public
        isAdminOf(_id)
    {
        delete unlockers[_id];
    }

    /**
     * @notice Register the smart name. The administrator and the record of the smart name are set up.
     * @param _id id
     * @param _unlocker unlocker
     */
    function isUnlocker(bytes32 _id, bytes32 _unlocker) public view
        returns (bool)
    {
        return (keccak256(abi.encodePacked(_unlocker)) == unlockers[_id]) && (unlockers[_id] != bytes32(0x0));
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
     * @param _name name
     * @param _ext extension
     * @return id
     */
    function getIdOf(bytes16 _name, bytes4 _ext) public pure
        returns (bytes32)
    {
        return SmartNameLibrary.getIdOf(_name, _ext);
    }

    /**
     * @notice Abandon the smart name. The contract is not deleted but the administrator and the record are reset to address(0x0)
     * @param smartName SmartName contract
     */
    function abandonSmartName(SmartName smartName) private
    {
        smartName.setAdministrator(address(0x0));
        smartName.setRecord(address(0x0));
    }

    /**
     * @notice Register the smart name. The administrator and the record of the smart name are set up.
     * @param _id id
     * @param _name name
     * @param _ext extension
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