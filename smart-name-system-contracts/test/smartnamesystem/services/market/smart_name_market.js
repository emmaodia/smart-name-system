/* Tests for SmartNameMarket contract */

let SmartNameRegistry = artifacts.require('SmartNameRegistry')
let SmartNameMarket = artifacts.require('SmartNameMarket')

let catchRevert = require("../../../exceptionsHelpers.js").catchRevert
let toBytes = function(input) { return web3.utils.fromAscii(input) }
let toWei = function(input) { return input * Math.pow(10, 14) }

contract('SmartNameMarket', function(accounts) {

    const administrator = accounts[0]
    const user1 = accounts[1]

    const unlocker = 'unlocker'

    const name1 = 'name'
    const ext1 = 'ext'
    const id1 = '0xac098044d08b519e4349f07a1c30d6e0b89cb69193face8a13eaee44fd8ceb31'

    const name2 = 'name2'
    const ext2 = 'ext2'
    const id2 = '0xb5060c27c60ff9b53a8c21bd133eccebbd2b1a61730bdb59f3d80763d0e415dd'

    const name3 = 'name3'
    const ext3 = 'ext3'
    const id3 = '0xdd4a9492a1f2f882f66e7bcc639f3a260a5481c8fb6ea5e8ea29a51568e63997'

    const name4 = 'name4'
    const ext4 = 'ext4'
    const id4 = '0xee4a9492a1f2f882f66e7bcc639f3a260a5481c8fb6ea5e8ea29a51568e63765'
    
    let smartNameMarketInstance

    beforeEach(async () => {
        // Deploiement
        smartNameRegistryInstance = await SmartNameRegistry.new()
        smartNameMarketInstance = await SmartNameMarket.new(smartNameRegistryInstance.address)

        //Register and unlock smart names
        await smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1))
        await smartNameRegistryInstance.setUnlocker(id1, toBytes(unlocker))

        await smartNameRegistryInstance.register(toBytes(name2), toBytes(ext2), {from: user1})
        await smartNameRegistryInstance.setUnlocker(id2, toBytes(unlocker), {from: user1})

        await smartNameRegistryInstance.register(toBytes(name3), toBytes(ext3))
        await smartNameRegistryInstance.setUnlocker(id3, toBytes(unlocker))
    })

    describe("Sell()", async() => {

        it("Sell a smart name", async() => {
            await smartNameMarketInstance.sell(id1, 2, toBytes(unlocker))
        })

        it("Sell a smart name which is not registered by the caller", async() => {
            await catchRevert(smartNameMarketInstance.sell(id2, 2, toBytes(unlocker)))
        })  

        it("Sell a smart name which is not registered", async() => {
            await catchRevert(smartNameMarketInstance.sell(id4, 2, toBytes(unlocker)))
        })  

        it("Sell a smart name which is not unlocked", async() => {
            await smartNameRegistryInstance.removeUnlocker(id1)
            await catchRevert(smartNameMarketInstance.sell(id1, 2, toBytes(unlocker)))
        })  

        it("Sell a smart name which is already to sale", async() => {
            await smartNameMarketInstance.sell(id1, 2, toBytes(unlocker))
            await catchRevert(smartNameMarketInstance.sell(id1, 2, toBytes(unlocker)))
        })  
    })

    describe("CancelSale()", async() => {

        it("Cancel sale of a smart name", async() => {
            await smartNameMarketInstance.sell(id1, 2, toBytes(unlocker))
            await smartNameMarketInstance.cancelSale(id1)
        })

        it("Cancel sale of a smart name which is not on sale", async() => {
            await catchRevert(smartNameMarketInstance.cancelSale(id2))
        }) 
        
        it("Cancel sale of a smart name which is not administrated by the caller", async() => {
            await smartNameRegistryInstance.modifyAdministrator(id1, user1)
            await smartNameRegistryInstance.setUnlocker(id1, toBytes(unlocker), {from: user1})
            await smartNameMarketInstance.sell(id1, 2, toBytes(unlocker), {from: user1})

            await catchRevert(smartNameMarketInstance.cancelSale(id1))
        })  

        it("Cancel sale of a smart name which is not registered", async() => {
            await catchRevert(smartNameMarketInstance.cancelSale(id3))
        }) 

        it("Cancel sale of a smart name which is already sell", async() => { 
            await smartNameMarketInstance.sell(id1, 2, toBytes(unlocker))
            await smartNameMarketInstance.buy(id1, {from: user1, value: toWei(2)})

            await catchRevert(smartNameMarketInstance.cancelSale(id1))
        })
    })

    describe("Buy()", async() => {

        it("Buy a smart name", async() => {
            await smartNameMarketInstance.sell(id1, 2, toBytes(unlocker))
            await smartNameMarketInstance.buy(id1, {from: user1, value: toWei(2)})

            await catchRevert(smartNameMarketInstance.getItem(id1))

            const result_getSmartName = await smartNameRegistryInstance.getSmartName(id1)
            const result_administrator_addr = result_getSmartName[4]
            const result_record = result_getSmartName[5]

            assert.equal(result_administrator_addr, user1, 'The administrator of the smart name is not correct')
            assert.equal(result_record, user1, 'The record of the smart name is not correct')
        })

        it("Buy a smart name which is not unlocked", async() => {
            await smartNameMarketInstance.sell(id1, 2, toBytes(unlocker))
            await smartNameRegistryInstance.removeUnlocker(id1)
    
            await catchRevert(smartNameMarketInstance.buy(id1, {from: user1, value: toWei(2)}))
        })

        it("Buy a smart name with not enough money", async() => {
            await smartNameMarketInstance.sell(id1, 2, toBytes(unlocker))

            await catchRevert(smartNameMarketInstance.buy(id1, {from: user1, value: toWei(1)}))
        })


        it("Buy a smart name which is already owned", async() => {
            await smartNameMarketInstance.sell(id1, 2, toBytes(unlocker))
   
            await catchRevert(smartNameMarketInstance.buy(id1, {value: toWei(2)}))
        })

        it("Buy a smart name which is not to buy", async() => {
            await catchRevert(smartNameMarketInstance.buy(id1, {value: toWei(2)}))
        })

        it("Buy a smart name which is already sell", async() => {
            await smartNameMarketInstance.sell(id1, 2, toBytes(unlocker))
            await smartNameMarketInstance.buy(id1, {from: user1, value: toWei(2)})
   
            await catchRevert(smartNameMarketInstance.buy(id1, {value: toWei(2)}))
        })
    })

    describe("ModifyPrice()", async() => {

        it("Modify the price of a smart name", async() => {
            await smartNameMarketInstance.sell(id1, 2, toBytes(unlocker))
            await smartNameMarketInstance.modifyPrice(id1, 5)
            
            const result_item = await smartNameMarketInstance.getItem(id1)
            const result_price = result_item[1]
            
            assert.equal(result_price, 5, 'The price of the smart name is not correct')
        })

        it("Modify the price of a smart name which is not to sell", async() => {
            await catchRevert(smartNameMarketInstance.modifyPrice(id1, 5))
        })
    })

    describe("GetNbItemsTotal()", async() => {

        it("Get the number of smart names to sale", async() => {
            await smartNameMarketInstance.sell(id1, 2, toBytes(unlocker))
            await smartNameMarketInstance.sell(id2, 2, toBytes(unlocker), {from: user1})
       
            assert.equal(await smartNameMarketInstance.getNbItemsTotal(), 2, 'The number of the smart name to sale is not correct')

            await smartNameMarketInstance.cancelSale(id1)

            assert.equal(await smartNameMarketInstance.getNbItemsTotal(), 1, 'The number of the smart name to sale is not correct')

            await smartNameMarketInstance.buy(id2, {value: toWei(2)})

            assert.equal(await smartNameMarketInstance.getNbItemsTotal(), 0, 'The number of the smart name to sale is not correct')            
        })
    })

    describe("GetSeller()", async() => {

        it("Get the seller of smart names", async() => {
            await smartNameMarketInstance.sell(id1, 2, toBytes(unlocker))
            await smartNameMarketInstance.sell(id3, 2, toBytes(unlocker))
       
            let result_seller = await smartNameMarketInstance.getSellerOf(id1)
            let result_address = result_seller[0]
            let result_nbItems = result_seller[1]
            let result_items = result_seller[2]

            assert.equal(result_address, administrator, 'The seller of the smart name is not correct')
            assert.equal(result_nbItems, 2, 'The number of items to sale is not correct')
            assert.equal(result_items[0], id1, 'The id of items to sale is not correct')
            assert.equal(result_items[1], id3, 'The id of items to sale is not correct')

            await smartNameMarketInstance.buy(id1, {from: user1, value: toWei(2)})

            result_seller = await smartNameMarketInstance.getSeller()
            result_address = result_seller[0]
            result_nbItems = result_seller[1]
            result_items = result_seller[2]

            assert.equal(result_address, administrator, 'The seller of the smart name is not correct')
            assert.equal(result_nbItems, 1, 'The number of items to sale is not correct')
            assert.equal(result_items[1], id3, 'The id of items to sale is not correct')    
        })
    })

    describe("GetItem()", async() => {

        it("Get item to sale", async() => {
            await smartNameMarketInstance.sell(id1, 2, toBytes(unlocker))

            const result_item = await smartNameMarketInstance.getItem(id1)
            const result_id = result_item[0]
            const result_price = result_item[1]
            const result_admin = result_item[2]

            assert.equal(result_id, id1, 'The id of the smart name is not correct')
            assert.equal(result_price, 2, 'The price of the smart name is not correct')
            assert.equal(result_admin, administrator, 'The address of the seller is not correct')  
        })

        it("Get item which not exists", async() => {  
            await catchRevert(smartNameMarketInstance.getItem(id3))
        })
    })
})