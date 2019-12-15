pragma solidity ^0.5.0;

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
    mapping (bytes32 => uint) private indexes;

    /**
     * @notice Number of smart names registered
     */
    uint nbSmartNamesTotal;

     /**
     * @notice Represents a smart name
     */
    struct SmartName {
        bytes32 id;
        bytes16 name;
        bytes4 ext;
        address administrator;
        address record;
    }

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
     */
    event LogForCreation(bytes32 id, bytes16 name, bytes4 ext, address administrator);

    /**
     * @notice Log when the administrator of a smart name is updated
     */
    event LogForAdministratorUpdate(bytes32 id, bytes16 name, bytes4 ext,  address administrator);

    /**
     * @notice Log when the record of a smart name is updates
     */
    event LogForRecordUpdate(bytes32 id, bytes16 name, bytes4 ext, address record);

    /**
     * @notice Log when a smart name is abandoned
     */
    event LogForAbandon(bytes32 id, bytes16 name, bytes4 ext);

    /**
     * @notice Modifier to verify that the caller is the administrator of the smart name
     * @param _id id of the smart name
     */
    modifier isAdminOf(bytes32 _id)
    {
        require(msg.sender == smartNames[_id].administrator, "Error: Only the administrator is authorized");
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
        require(smartNames[_id].administrator != address(0x0), "Error: The smart name is not registered");
        _;
    }

    /**
     * @notice Modifier to verify that the smart name is not registered
     * @param _name name
     * @param _ext extension
     */
    modifier isNotRegistered(bytes16 _name, bytes4 _ext)
    {
        bytes32 id = getIdOf(_name, _ext);
        require(smartNames[id].administrator == address(0x0), "Error: The smart name is already registered");
        _;
    }

    /**
     * @notice Modifier to verify that the smart name is not registered
     * @param _id id
     */
    modifier isId(bytes32 _id)
    {
        require(smartNames[_id].administrator != address(0x0), "Error: This is not an id of a smart name");
        _;
    }

    /**
     * @notice Modifier to verify that the name and the extension are not empty
     * @param _name name
     * @param _ext extension
     */
    modifier SmartNameNotEmpty(bytes16 _name, bytes4 _ext)
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
     * @notice Register a smart name
     * @param _name name
     * @param _ext extension
     */
    function register(bytes16 _name, bytes4 _ext) public
        isNotRegistered(_name, _ext) SmartNameNotEmpty(_name, _ext)
    {
        bytes32 id = getIdOf(_name, _ext);

        // Create smart name
        SmartName memory newSmartName = SmartName({id : id, name: _name, ext: _ext, administrator: msg.sender, record: msg.sender});
        smartNames[id] = newSmartName;
        nbSmartNamesTotal++;

        // Update Administrator
        administrators[msg.sender].addr = msg.sender;
        administrators[msg.sender].wallet.push(id);
        administrators[msg.sender].nbSmartNames++;

        // Update index in the wallet
        indexes[id] = administrators[msg.sender].nbSmartNames-1;

        emit LogForCreation(id, _name, _ext, msg.sender);
    }

    /**
     * @notice Abandon a smart name
     * @param _id id of the smart name
     */
    function abandon(bytes32 _id) public
            isRegistered(_id) isAdminOf(_id)
    {
        bytes16 name = smartNames[_id].name;
        bytes4 ext = smartNames[_id].ext;

        // Delete smart name
        delete smartNames[_id];
        nbSmartNamesTotal--;

        // Update Administrator
        administrators[msg.sender].nbSmartNames--;
        delete administrators[msg.sender].wallet[indexes[_id]];
        if(administrators[msg.sender].nbSmartNames==0) {
            delete administrators[msg.sender];
        }

        // Update index in the wallet
        delete indexes[_id];

        emit LogForAbandon(_id, name, ext);
    }

   /**
     * @notice Modify the administrator of a smart name
     * @param _id id of the smart name
     * @param _newAdministrator new administrator
     */
    function modifyAdministrator(bytes32 _id, address _newAdministrator) public
        isRegistered(_id) isAdminOf(_id) addressNotEmpty(_newAdministrator)
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
        smartNames[_id].administrator = _newAdministrator;
        smartNames[_id].record = _newAdministrator;

        // Update index in the wallet
        indexes[_id] = administrators[_newAdministrator].nbSmartNames-1;

        emit LogForAdministratorUpdate(_id,  smartNames[_id].name,  smartNames[_id].ext, _newAdministrator);
    }

    /**
     * @notice Modify the record of a smart name
     * @param _id id of the smart name
     * @param _newRecord new record
     */
    function modifyRecord(bytes32 _id, address _newRecord) public
        isRegistered(_id) isAdminOf(_id) addressNotEmpty(_newRecord)
    {
        require(smartNames[_id].record != _newRecord, "Error : This record is already associate to this smart name");

        // Update record
        smartNames[_id].record = _newRecord;

        emit LogForRecordUpdate(_id,  smartNames[_id].name, smartNames[_id].ext, _newRecord);
    }

    /**
     * @notice Get smart name by id
     * @param _id id of a smart name
     * @return id, name, extension, administrator, record
     */
    function getSmartName(bytes32 _id) public view
        isId(_id) returns (bytes32, bytes16, bytes4, address, address)
    {
        return (_id, smartNames[_id].name, smartNames[_id].ext, smartNames[_id].administrator, smartNames[_id].record);
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
        address adminAddress = smartNames[_id].administrator;
        return getAdministratorByAddress(adminAddress);
    }

    /**
     * @notice Get Administrator by Address
     * @param _address address
     * @return address, number of smart names, wallet
     */
    function getAdministratorByAddress(address _address) public view
        isAdmin(_address) addressNotEmpty(_address) returns (address, uint, bytes32[] memory)
    {
        Administrator memory admin = administrators[_address];
        return(admin.addr, admin.nbSmartNames, admin.wallet);
    }

    /**
     * @notice Get id of a smart name
     * @param _name name
     * @param _ext extension
     * @return id
     */
    function getIdOf(bytes16 _name, bytes4 _ext) public pure
        SmartNameNotEmpty(_name, _ext) returns (bytes32)
    {
        return keccak256(abi.encodePacked(_name, _ext));
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
}