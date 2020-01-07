pragma solidity ^0.5.0;

import "../SmartNameService.sol";
import "../../utils/SmartNameLibrary.sol";
import "../../registry/SmartName.sol";

import "@openzeppelin/contracts/payment/PullPayment.sol";

/**
 * @title SmartNameMarket
 * @author Steve Despres - @stevedespres - steve.despres@protonmail.com
 * @notice This contract represents a market of smart name. Users can put on sale and buy smart names registered on a SmartNameRegistry
 */
contract SmartNameMarket is SmartNameService, PullPayment {

    /**
     * @notice Mapping of id and Item
     */
    mapping (bytes32 => Item) public items;

    /**
     * @notice Mapping of address and Seller
     */
    mapping (address => Seller) public sellers;

    /**
     * @notice Mapping of smart names ids and their index
     */
    mapping (bytes32 => uint) public indexes;

    /**
     * @notice Mapping of smart names ids and their global index
     */
    mapping (bytes32 => uint) public globalIndexes;

    /**
     * @notice All items for sale
     */
    bytes32[] public allItems;

    /**
     * @notice Number of smart names for sale
     */
    uint public nbItemsTotal;

    /**
     * @notice Represents a seller of smart names
     */
    struct Seller {
        address addr;
        bytes32[] items;
        uint nbItems;
    }

    /**
     * @notice Represents an Item : smart name, its price and its unlocker
     */
    struct Item {
        SmartName smartName;
        uint price;
        bytes32 unlocker;
    }

    /**
     * @notice Log when a smart name is put on sale
     * @param id id of the smartName
     * @param price price
     */
    event LogForPutOnSaleOnMarket(bytes32 id, uint price);

    /**
     * @notice Log when a smart name is sale
     * @param id id of the smartName
     * @param price price
     * @param buyer buyer
     */
    event LogForSaleOnMarket(bytes32 id, uint price, address buyer);

    /**
     * @notice Log when the price of a smart name is updated
     * @param id id of the smart name
     * @param price price
     */
    event LogForPriceUpdateOnMarket(bytes32 id, uint price);

    /**
     * @notice Log when a smart name sale is canceled
     * @param id id of the smart name
     */
    event LogForCancelSaleOnMarket(bytes32 id);

    /**
     * @notice Modifier to verify that the caller is the administrator of the smart name
     * @param _id id of the smart name
     */
    modifier isAdminOf(bytes32 _id)
    {
        (address adminAddress,,) = smartNameRegistry.getAdministratorOf(_id);
        require(msg.sender == adminAddress, "Error: Only the seller is authorized");
        _;
    }

    /**
     * @notice Modifier to verify that the adress is a seller
     * @param _address address
     */
    modifier isSeller(address _address)
    {
        require(sellers[_address].addr != address(0x0), "Error: This address is not a seller");
        _;
    }

    /**
     * @notice Modifier to verify that the smart name is on sale
     * @param _id id of the smart name
     */
    modifier isOnSale(bytes32 _id)
    {
        require(isForSale(_id), "Error: The smart name is not on sale");
        _;
    }

    /**
     * @notice Modifier to verify that the smart name is not on sale
     * @param _id id
     */
    modifier isNotOnSale(bytes32 _id)
    {
        require(!isForSale(_id), "Error: The smart name is already on sale");
        _;
    }

   /**
     * @notice Constructor of a Smart name market
     * @param _smartNameRegistryAddress SmartNameRegistry address
     */
    constructor(address _smartNameRegistryAddress) SmartNameService(_smartNameRegistryAddress) public
    {}

    /**
     * @notice Put on sale a smart name
     * @param _id id of a smart name
     * @param _price price (1ETH = 10^14)
     * @return id and price
     */
    function sell(bytes32 _id, uint _price, bytes32 _unlocker) public
        isNotOnSale(_id) isAdminOf(_id) returns(bytes32, uint)
    {
        require(smartNameRegistry.isUnlocker(_id, _unlocker), "Error : the smart name is locked or the unlocker is not correct");

        (, SmartName smartName,,,,) = smartNameRegistry.getSmartName(_id);

        // Create item
        Item memory item = Item(smartName, _price, _unlocker);
        items[_id] = item;
        nbItemsTotal++;
        allItems.push(_id);

        // Update Seller
        address sellerAddress = items[_id].smartName.getAdministrator();
        sellers[sellerAddress].addr = sellerAddress;
        sellers[sellerAddress].items.push(_id);
        sellers[sellerAddress].nbItems++;

        // Update index in the wallet
        indexes[_id] = sellers[sellerAddress].items.length-1;
        globalIndexes[_id] = allItems.length-1;

        emit LogForPutOnSaleOnMarket(_id, _price);
        return (_id, _price);
    }

    /**
     * @notice Cancel the sale of a smart name
     * @param _id id of a smart name
     * @return id
     */
    function cancelSale(bytes32 _id) public
        isOnSale(_id) isAdminOf(_id) returns(bytes32)
    {
        removeItem(_id, msg.sender);

        emit LogForCancelSaleOnMarket(_id);
        return (_id);
    }

    /**
     * @notice Buy a smart name on sale
     * @dev (1ETH = 10^8 wei) <-> (price in ETH -> price * 10^4) <-> (price in wei -> price * 10^14)
     * @param _id id
     * @return id, price and buyer address
     */
    function buy(bytes32 _id) public payable
        isOnSale(_id) returns(bytes32, uint, address)
    {
        uint price = items[_id].price;
        address sellerAddress = items[_id].smartName.getAdministrator();
        require(msg.value >= price * (10**14), "Error : Not enough money to buy this smart name");
        require(msg.sender != sellerAddress, "Error : You are already the administrator avec this smart name");

        // Payment
        _asyncTransfer(sellerAddress, price * (10**14));

        // Update SmartName
        smartNameRegistry.modifyAdministratorWithUnlocker(_id, msg.sender, items[_id].unlocker);

        // Remove Item
        removeItem(_id, sellerAddress);

        emit LogForSaleOnMarket(_id, price, msg.sender);
        return (_id, price, msg.sender);
    }


    /**
     * @notice Modify the price of a smart name
     * @param _id id
     * @param _newPrice new price (1ETH = 10^4)
     * @return id, price
     */
    function modifyPrice(bytes32 _id, uint _newPrice) public payable
        isOnSale(_id) isAdminOf(_id) returns(bytes32, uint)
    {
        items[_id].price = _newPrice;

        emit LogForPriceUpdateOnMarket(_id, _newPrice);
        return (_id, _newPrice);
    }

    /**
     * @notice Get item by smart name id
     * @param _id id
     * @return id, SmartName contract and buyer address
     */
    function getItem(bytes32 _id) public view
        isOnSale(_id) returns(bytes32, uint, address)
    {
        return (_id, items[_id].price, items[_id].smartName.getAdministrator());
    }

    /**
     * @notice Get seller informations
     * @return id, SmartName contract and buyer address
     */
    function getSeller() public view
        returns(address, uint, bytes32[] memory)
    {
        return getSellerByAddress(msg.sender);
    }

    /**
     * @notice Get seller of a smart name
     * @param _id id
     * @return id, SmartName contract and buyer address
     */
    function getSellerOf(bytes32 _id) public view
        returns(address, uint, bytes32[] memory)
    {
        return getSellerByAddress(items[_id].smartName.getAdministrator());
    }

    /**
     * @notice Get seller by address
     * @param _seller address of a seller
     * @return id, SmartName contract and buyer address
     */
    function getSellerByAddress(address _seller) public view
        isSeller(_seller) returns(address, uint, bytes32[] memory)
    {
        return (_seller, sellers[_seller].nbItems, sellers[_seller].items);
    }

    /**
     * @notice Get all items ids
     * @return list of all items ids
     */
    function getAllItems() public view
        returns(bytes32[] memory)
    {
        return allItems;
    }

    /**
     * @notice Get number of smart names on sale
     * @return number of smart names on sale
     */
    function getNbItemsTotal() public view
        returns(uint)
    {
        return nbItemsTotal;
    }

    /**
     * @notice Check if a smart name is for sale
     * @return true or false
     */
    function isForSale(bytes32 _id) public view
        returns(bool)
    {
        return items[_id].smartName != SmartName(0x0);
    }

    /**
     * @notice Remove item
     * @param _id id
     * @param _seller seller address
     */
    function removeItem(bytes32 _id, address _seller) private
    {
        // Update Seller
        sellers[_seller].nbItems--;
        if (sellers[_seller].nbItems == 0) {
            delete sellers[_seller];
        } else {
            delete sellers[_seller].items[indexes[_id]];
        }

        // Delete item
        delete items[_id];
        delete allItems[globalIndexes[_id]];
        nbItemsTotal--;

        // Update index
        delete indexes[_id];
        delete globalIndexes[_id];
    }
}