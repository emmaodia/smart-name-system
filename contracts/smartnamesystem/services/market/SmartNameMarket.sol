pragma solidity ^0.5.0;

import "../SmartNameService.sol";
import "../../utils/SmartNameLibrary.sol";
import "../../registry/SmartName.sol";

import "@openzeppelin/contracts/payment/PullPayment.sol";

/**
 * @title SmartNameMarket
 * @author Steve Despres - @stevedespres - steve.despres@protonmail.com
 * @notice This contract represents a market of smart name. Users can put on sale and buy smart names registered on a SmartNameRegistry.
 */
contract SmartNameMarket is SmartNameService, PullPayment{

    /**
     * @notice Mapping of id and Item
     */
    mapping (bytes32 => Item) public items;

    /**
     * @notice Mapping of address and Seller
     */
    mapping (address => Seller) public sellers;

    /**
     * @notice Mapping of ids and their index
     */
    mapping (bytes32 => uint) public indexes;

    /**
     * @notice Number of smart names to sale
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
     * @notice Represents an Item : smart name and its price
     */
    struct Item {
        SmartName smartName;
        uint price;
    }

    /**
     * @notice Log when a smart name is put on sale
     * @param id id of the smartName
     * @param price price
     */
    event LogForCreation(bytes32 id, uint price);

    /**
     * @notice Log when a smart name is sale
     * @param id id of the smartName
     * @param price price
     * @param buyer buyer
     */
    event LogForSale(bytes32 id, uint price, address buyer);

    /**
     * @notice Log when the price of a smart name is updated
     * @param id id of the smart name
     * @param price price
     */
    event LogForPriceUpdate(bytes32 id, uint price);

    /**
     * @notice Log when a smart name sale is canceled
     * @param id id of the smart name
     */
    event LogForCancelSale(bytes32 id);

    /**
     * @notice Modifier to verify that the caller is the administrator of the smart name
     * @param _id id of the smart name
     */
    modifier isAdminOf(bytes32 _id)
    {
        require(msg.sender == items[_id].smartName.getAdministrator(), "Error: Only the seller is authorized");
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
        require(items[_id].smartName != SmartName(0x0), "Error: The smart name is not on sale");
        _;
    }

    /**
     * @notice Modifier to verify that the smart name is not on sale
     * @param _id id
     */
    modifier isNotOnSale(bytes32 _id)
    {
        require((items[_id].smartName == SmartName(0x0)),
        "Error: The smart name is already on sale");
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
     * @param _price price
     * @return id and price
     */
    function sell(bytes32 _id, uint _price) public
        isNotOnSale(_id) isAdminOf(_id) returns(bytes32, uint)
    {
        (, SmartName smartName,,,,) = smartNameRegistry.getSmartName(_id);

        // Create item
        Item memory item = Item(smartName, _price);
        items[_id] = item;
        nbItemsTotal++;

        // Update Seller
        address sellerAddress = smartName.getAdministrator();
        sellers[sellerAddress].addr = sellerAddress;
        sellers[sellerAddress].items.push(_id);
        sellers[sellerAddress].nbItems++;

        // Update index in the wallet
        indexes[_id] = sellers[sellerAddress].nbItems-1;

        emit LogForCreation(_id, _price);
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
        removeItem(_id);

        emit LogForCancelSale(_id);
        return (_id);
    }

    /**
     * @notice Buy a smart name on sale
     * @param _id id
     * @return id, price and buyer address
     */
    function buy(bytes32 _id) public payable
        isOnSale(_id) returns(bytes32, uint, address)
    {
        uint price = items[_id].price;
        address sellerAddress = items[_id].smartName.getAdministrator();
        require(msg.value > price, "Error : Not enough money to buy this smart name");
        require(msg.sender != sellerAddress, "Error : You are already the administrator avec this smart name");

        // Payment
        _asyncTransfer(sellerAddress, price);

        // Remove Item
        removeItem(_id);

        // Update SmartName
        smartNameRegistry.modifyAdministrator(_id, msg.sender);

        emit LogForSale(_id, price, msg.sender);
        return (_id, price, msg.sender);
    }


    /**
     * @notice Modify the price of a smart name
     * @param _id id
     * @param _newPrice new price
     * @return id, price
     */
    function modifyPrice(bytes32 _id, uint _newPrice) public payable
        isOnSale(_id) isAdminOf(_id) returns(bytes32, uint)
    {
        items[_id].price = _newPrice;

        emit LogForPriceUpdate(_id, _newPrice);
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
     * @notice Get number of smart names on sale
     * @return number of smart names on sale
     */
    function getNbItemsTotal() public view
        returns(uint)
    {
        return nbItemsTotal;
    }

    /**
     * @notice Remove item
     * @param _id id
     */
    function removeItem(bytes32 _id) private
        isOnSale(_id) isAdminOf(_id)
    {
        // Delete item
        delete items[_id];
        nbItemsTotal--;

        // Update Seller
        address sellerAddress = items[_id].smartName.getAdministrator();
        sellers[sellerAddress].nbItems--;
        if ( sellers[sellerAddress].nbItems == 0) {
            delete sellers[sellerAddress];
        } else {
            delete sellers[sellerAddress].items[indexes[_id]];
        }

        // Update index
        delete indexes[_id];
    }
}