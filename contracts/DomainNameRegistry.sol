pragma solidity ^0.5.0;


/**
This smart contract represents a register of domain name. It permits to associate ethereum address with a readable domain name.
 */
contract DomainNameRegistry {

    /* Mapping of ids and domain names */
    mapping (bytes32 => DomainName) public domains;
    /* Mapping of addresses and administrators */
    mapping (address => Administrator) public administrators;
    /* Mapping of ids of domain names and indexes in wallets */
    mapping (bytes32 => uint) private indexes;
    /* Number of domain names */
    uint nbDomainNamesTotal;

    /*
    Represents a domain name.
    The administrator is the creator of the domain name, he can manage the domain name attributs.
    The record is an ethereum address.
    */
    struct DomainName {
        bytes32 id;
        bytes16 name;
        bytes4 ext;
        address administrator;
        address record;
    }

    struct Administrator {
        address addr;
        bytes32[] wallet;
        uint nbDomainNames;
    }

    /* Events to log actions */
    event LogForCreation(bytes32 id, bytes16 name, bytes4 ext, address administrator);
    event LogForAdministratorUpdate(bytes32 id, bytes16 name, bytes4 ext,  address administrator);
    event LogForRecordUpdate(bytes32 id, bytes16 name, bytes4 ext, address record);
    event LogForAbandon(bytes32 id, bytes16 name, bytes4 ext);

    /* Modifier to verify if the caller is the administrator of the domain name */
    modifier verifyAdministrator(bytes16 _name, bytes4 _ext) {
        bytes32 id = getIdOfDomainName(_name, _ext);
        require(msg.sender == domains[id].administrator, "Error: Only the administrator is authorized");
        _;}

    /*
    Modifier to verify the format of a domain name
    To respect the format of traditionnal domain name (name.extension : abc.com, eth.org, etc.)
    and store domain name in string type,
    the name is limited to 8 characters and the extension is limited to 6 charactères
    */
    modifier verifyDomainName(bytes16 _name, bytes4 _ext) {
            require(_name[0] != 0, "Error: The name is empty");
            require(_ext[0] != 0, "Error: The extension is empty");
        _;}

    modifier verifyAddressNotEmpty(address _address) {
        require(_address != address(0x0), "Error: The address is empty");
    _;}

    /* Register a domain name */
    function register(bytes16 _name, bytes4 _ext) public
        verifyDomainName(_name, _ext) returns(bool)
    {
        bytes32 id = getIdOfDomainName(_name, _ext);
        require(!nameExists(id), "Error : This name is already registered");

        // Create domain name
        DomainName memory newDomainName = DomainName({id : id, name: _name, ext: _ext, administrator: msg.sender, record: msg.sender});
        domains[id] = newDomainName;
        nbDomainNamesTotal++;

        // Update Administrator
        administrators[msg.sender].addr = msg.sender;
        administrators[msg.sender].wallet.push(id);
        administrators[msg.sender].nbDomainNames++;

        // Update index
        indexes[id] = administrators[msg.sender].nbDomainNames-1;

        emit LogForCreation(id, _name, _ext, msg.sender);
        return true;
    }

    /* Abandon a domain name */
    function abandon(bytes16 _name, bytes4 _ext) public
            verifyAdministrator(_name, _ext) returns(bool)
    {
        bytes32 id = getIdOfDomainName(_name, _ext);
        require(nameExists(id), "Error : This name is not registered");

        // Delete domain name
        delete domains[id];
        nbDomainNamesTotal--;

        // Update Administrator
        administrators[msg.sender].nbDomainNames--;
        delete administrators[msg.sender].wallet[indexes[id]];
        if(administrators[msg.sender].nbDomainNames==0){
            delete administrators[msg.sender];
        }

        // Update index
        delete indexes[id];

        emit LogForAbandon(id, _name, _ext);
        return true;
    }

    /* Modify the administrator of a domain name */
    function modifyAdministrator(bytes16 _name, bytes4 _ext, address _newAdministrator) public
        verifyAdministrator(_name, _ext) verifyAddressNotEmpty(_newAdministrator) returns(bool)
    {
        bytes32 id = getIdOfDomainName(_name, _ext);
        require(nameExists(id), "Error : This name is not registered");
        require(msg.sender != _newAdministrator, "Error : This address is already administrator of this domain name");
    
        // Old Administrator
        administrators[msg.sender].nbDomainNames--;
        delete administrators[msg.sender].wallet[indexes[id]];
        if(administrators[msg.sender].nbDomainNames==0){
            delete administrators[msg.sender];
        }

        // New Administrator
        administrators[_newAdministrator].addr = _newAdministrator;
        administrators[_newAdministrator].wallet.push(id);
        administrators[_newAdministrator].nbDomainNames++;

        //update domain name
        domains[id].administrator = _newAdministrator;
        domains[id].record = _newAdministrator;

        // Update index
        indexes[id] = administrators[_newAdministrator].nbDomainNames-1;

        emit LogForAdministratorUpdate(id, _name, _ext, _newAdministrator);
        return true;
    }

    /* Modify the record of a domain name */
    function modifyRecord(bytes16 _name, bytes4 _ext, address _record) public
        verifyAdministrator(_name, _ext) verifyAddressNotEmpty(_record) returns(bool)
    {
        bytes32 id = getIdOfDomainName(_name, _ext);
        require(nameExists(id), "Error : This name is not registered");
        require(domains[id].record != _record, "Error : This record is already associate to this domain name");

        // Update record
        domains[id].record = _record;

        emit LogForRecordUpdate(id, _name, _ext, _record);
        return true;
    }

    /* Get domain name by name */
    function getDomainNameOf(bytes16 _name, bytes4 _ext) public view
       returns (bytes32, bytes16, bytes4, address, address)
    {
        bytes32 id = getIdOfDomainName(_name, _ext);
        return getDomainNameById(id);
    }
   function getDomainNameById(bytes32 _id) public view
       returns (bytes32, bytes16, bytes4, address, address)
    {
        require(nameExists(_id), "Error : This name is not registered");
        return (_id, domains[_id].name, domains[_id].ext, domains[_id].administrator, domains[_id].record);
    }

    function getAdministratorOf(bytes16 _name, bytes4 _ext) public view returns (address, uint, bytes32[] memory)
    {
        bytes32 id = getIdOfDomainName(_name, _ext);
        require(nameExists(id), "Error : This name is not registered");
        address adminAddress = domains[id].administrator;
        return getAdministratorByAddress(adminAddress);
    }

    function getAdministratorByAddress(address _adminAddress) public view
        verifyAddressNotEmpty(_adminAddress) returns (address, uint, bytes32[] memory)
    {
        require(administratorExists(_adminAddress), "Error : This address is not an administrator");
        Administrator memory admin = administrators[_adminAddress];
        return(admin.addr, admin.nbDomainNames, admin.wallet);
    }

    function getIdOfDomainName(bytes16 _name, bytes4 _ext) public pure returns (bytes32)
    {
        return keccak256(abi.encodePacked(_name, _ext));
    }










        /* Test if name exists */
    function nameExists(bytes32 _id) private view returns (bool)
    {
        if(domains[_id].administrator == address(0x0)) {
            return false;
        } else {
            return true;
        }
    }

        /* Test if name exists */
    function administratorExists(address _address) private view returns (bool)
    {
        if(administrators[_address].addr == address(0x0)) {
            return false;
        } else {
            return true;
        }
    }
}