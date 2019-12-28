/*


This test file has been updated for Truffle version 5.0. If your tests are failing, make sure that you are
using Truffle version 5.0. You can check this by running "truffle version"  in the terminal. If version 5 is not
installed, you can uninstall the existing version with `npm uninstall -g truffle` and install the latest version (5.0)
with `npm install -g truffle`.

*/

let SmartNameRegistry = artifacts.require('SmartNameRegistry')

let catchRevert = require("./exceptionsHelpers.js").catchRevert

let toAscii = function(input) { return web3.utils.toAscii(input).replace(/\u0000/g, '') }
let toBytes = function(input) { return web3.utils.fromAscii(input) }

contract('SmartNameRegistry', function(accounts) {

    const administrator = accounts[0]
    const user = accounts[1]
 
    const record = accounts[3];
    const emptyName = '';
    const emptyExt = '';

    const emptyId = "0x0000000000000000000000000000000000000000000000000000000000000000"

    const name1 = 'name';
    const ext1 = 'ext';
    const id1 = '0xac098044d08b519e4349f07a1c30d6e0b89cb69193face8a13eaee44fd8ceb31';

    const name2 = 'name2';
    const ext2 = 'ext2';
    const id2 = '0xb5060c27c60ff9b53a8c21bd133eccebbd2b1a61730bdb59f3d80763d0e415dd';
    
    const name3 = 'name3';
    const ext3 = 'ext3';
    const id3 = '0xdd4a9492a1f2f882f66e7bcc639f3a260a5481c8fb6ea5e8ea29a51568e63997';

    let smartNameRegistryInstance

    beforeEach(async () => {
        smartNameRegistryInstance = await SmartNameRegistry.new()
    })

    describe("Register()", async() => {

        it("Register a smart name", async() => {
            await smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1))
            await smartNameRegistryInstance.register(toBytes(name2), toBytes(ext2), {from: user})
        })    

        it("Register several smart names", async() => {
            await smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1))
            await smartNameRegistryInstance.register(toBytes(name2), toBytes(ext2))
            await smartNameRegistryInstance.register(toBytes(name3), toBytes(ext3))
        })
        
        it("Register a smart name with bad format", async() => {
            await catchRevert(smartNameRegistryInstance.register(toBytes(emptyName), toBytes(ext1)))
            await catchRevert(smartNameRegistryInstance.register(toBytes(name1), toBytes(emptyExt)))
            await catchRevert(smartNameRegistryInstance.register(toBytes(emptyName), toBytes(emptyExt)))
        })
                
        it("Register a smart already registered", async() => {
            await smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1))
            await catchRevert(smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1)))
        })

    })

    describe("Abandon()", async() => { 

        it("Abandon a smart name", async() => {
            await smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1))
            await smartNameRegistryInstance.abandon(id1)

            await catchRevert(smartNameRegistryInstance.getSmartName(id1))
            await catchRevert(smartNameRegistryInstance.getAdministratorOf(id1))
            await catchRevert(smartNameRegistryInstance.getAdministratorByAddress(administrator))
        })

        it("Abandon a smart name among several", async() => {
            await smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1))
            await smartNameRegistryInstance.register(toBytes(name2), toBytes(ext2))
            await smartNameRegistryInstance.register(toBytes(name3), toBytes(ext3))

            await smartNameRegistryInstance.abandon(id1)

            await catchRevert(smartNameRegistryInstance.getSmartName(id1))
            await catchRevert(smartNameRegistryInstance.getAdministratorOf(id1))

            const result_getAdministrator = await smartNameRegistryInstance.getAdministratorByAddress(administrator)
            const result_address = result_getAdministrator[0]
            const result_nbSmartName = result_getAdministrator[1]
            const result_wallet = result_getAdministrator[2]

            assert.equal(result_address, administrator, 'The address of the administrator is not correct')
            assert.equal(result_nbSmartName, 2, 'The number of smart names is not correct')
            assert.equal(result_wallet[0], emptyId, 'The id of smart name is not deleted of the wallet')
        })

        it("Abandon a smart name which doesn't exist", async() => {
            await catchRevert(smartNameRegistryInstance.abandon(id1))
         })

        it("Abandon a smart name if the caller is not the administrator", async() => {
            await smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1))
            await smartNameRegistryInstance.modifyAdministrator(id1, user)
            await catchRevert(smartNameRegistryInstance.abandon(id1))
         })

         it("Abandon a smart name with unlocker", async() => {
            await smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1))
            await smartNameRegistryInstance.setUnlocker(id1, toBytes("unlocker"))
            await smartNameRegistryInstance.abandonWithUnlocker(id1, toBytes("unlocker"))
        })

        it("Abandon a smart name with bad unlocker", async() => {
            await smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1))
            await smartNameRegistryInstance.setUnlocker(id1, toBytes("unlocker"))
            await catchRevert(smartNameRegistryInstance.abandonWithUnlocker(id1, toBytes("badunlocker")))
        })
    })


    describe("ModifyAdministrator()", async() => { 

        it("Modify the administrator of a smart name", async() => {
            await smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1))
            await smartNameRegistryInstance.register(toBytes(name2), toBytes(ext2))

            await smartNameRegistryInstance.modifyAdministrator(id1, user)

            const result_getSmartName = await smartNameRegistryInstance.getSmartName(id1)
            const result_administrator_addr = result_getSmartName[4]

            assert.equal(result_administrator_addr, user, 'The administrator of the smart name is not correct')

            const result_getAdministrator = await smartNameRegistryInstance.getAdministratorOf(id1)
            const result_address = result_getAdministrator[0]
            const result_nbSmartName = result_getAdministrator[1]
            const result_wallet = result_getAdministrator[2]

            assert.equal(result_address, user, 'The address of the administrator is not correct')
            assert.equal(result_nbSmartName, 1, 'The number of smart names is not correct')
            assert.equal(result_wallet[0], id1, 'The id of smart name is not correct')

            const result_getOldAdministrator = await smartNameRegistryInstance.getAdministratorByAddress(administrator)
            const result_oldAddress = result_getOldAdministrator[0]
            const result_oldNbSmartName = result_getOldAdministrator[1]
            const result_oldWallet = result_getOldAdministrator[2]

            assert.equal(result_oldAddress, administrator, 'The address of the old administrator is not correct')
            assert.equal(result_oldNbSmartName, 1, 'The number of smart names of the old administrator is not correct')
            assert.equal(result_oldWallet[0], emptyId, 'The smart name of the old administrator not abandon')

         })

         it("Modify the administrator of a smart name with another account", async() => {
            await smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1),{from: user})
            await smartNameRegistryInstance.modifyAdministrator(id1, administrator,{from: user})
         })

        it("Modify the administrator of a smart name which doesn't exist", async() => {
            await catchRevert(smartNameRegistryInstance.modifyAdministrator(id1, user))
         })

        it("Modify the administrator of a smart name with the same administrator", async() => {
            await smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1))
            await catchRevert(smartNameRegistryInstance.modifyAdministrator(id1, administrator))
        })

        it("Modify the administrator if the caller is not the administrator of the smart name", async() => {
            await smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1))
            await smartNameRegistryInstance.modifyAdministrator(id1, user)
            await catchRevert(smartNameRegistryInstance.modifyAdministrator(id1, administrator))
        })

        it("Modify the administrator with unlocker", async() => {
            await smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1))
            await smartNameRegistryInstance.setUnlocker(id1, toBytes("unlocker"))
            await smartNameRegistryInstance.modifyAdministratorWithUnlocker(id1, user, toBytes("unlocker"))
        })

        it("Modify the administrator with bad unlocker", async() => {
            await smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1))
            await smartNameRegistryInstance.setUnlocker(id1, toBytes("unlocker"))
            await catchRevert(smartNameRegistryInstance.modifyAdministratorWithUnlocker(id1, user, toBytes("badunlocker")))
        })
    })

    describe("ModifyRecord()", async() => { 

         it("Modify the record of a smart name", async() => {
            await smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1))
            await smartNameRegistryInstance.modifyRecord(id1, record)

            const result_smartname = await smartNameRegistryInstance.getSmartName(id1)
            const result_record = result_smartname[5]
            assert.equal(result_record, record, 'The record of the smart name is not correct')
         })

         it("Modify the record of a smart name with another account", async() => {
            await smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1), {from: user})
            await smartNameRegistryInstance.modifyRecord(id1, administrator, {from: user})
         })

        it("Modify the administrator of a smart name which doesn't exist", async() => {
            await catchRevert(smartNameRegistryInstance.modifyRecord(id1, record))
         })

        it("Modify the record of a smart name with the same record", async() => {
            await smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1))
            await catchRevert(smartNameRegistryInstance.modifyAdministrator(id1, administrator))
        })

        it("Modify the record if the caller is not the administrator of the smart name", async() => {
            await smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1))
            await smartNameRegistryInstance.modifyAdministrator(id1, user)
            await catchRevert(smartNameRegistryInstance.modifyAdministrator(id1, record))
        })

        it("Modify the record with unlocker", async() => {
            await smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1))
            await smartNameRegistryInstance.setUnlocker(id1, toBytes("unlocker"))
            await smartNameRegistryInstance.modifyAdministratorWithUnlocker(id1, record, toBytes("unlocker"))
        })

        it("Modify the record with bad unlocker", async() => {
            await smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1))
            await smartNameRegistryInstance.setUnlocker(id1, toBytes("unlocker"))
            await catchRevert(smartNameRegistryInstance.modifyAdministratorWithUnlocker(id1, record, toBytes("badunlocker")))
        })

    })

    describe("GetAdministrator()", async() => { 

        it("Get administrator", async() => {
            await smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1))
            await smartNameRegistryInstance.register(toBytes(name2), toBytes(ext2))

            const result_getAdministrator = await smartNameRegistryInstance.getAdministrator()
            const result_address = result_getAdministrator[0]
            const result_nbSmartName = result_getAdministrator[1]
            const result_wallet = result_getAdministrator[2]

            assert.equal(result_address, administrator, 'The address of the administrator is not correct')
            assert.equal(result_nbSmartName, 2, 'The number of the smart names is not correct')
            assert.equal(result_wallet[0], id1, 'The id of the smart name is not correct')
            assert.equal(result_wallet[1], id2, 'The id of the smart name is not correct')
        }) 

        it("Get administrator of a smart name", async() => {
            await smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1))
            await smartNameRegistryInstance.register(toBytes(name2), toBytes(ext2))

            const result_getAdministrator = await smartNameRegistryInstance.getAdministratorOf(id1)
            const result_address = result_getAdministrator[0]
            const result_nbSmartName = result_getAdministrator[1]
            const result_wallet = result_getAdministrator[2]

            assert.equal(result_address, administrator, 'The address of the administrator is not correct')
            assert.equal(result_nbSmartName, 2, 'The number of smart names is not correct')
            assert.equal(result_wallet[0], id1, 'The id of the smart name is not correct')
            assert.equal(result_wallet[1], id2, 'The id of the smart name is not correct')
        })    

        it("Get administrators of several smart names", async() => {

            await smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1))
            await smartNameRegistryInstance.register(toBytes(name2), toBytes(ext2))
            await smartNameRegistryInstance.register(toBytes(name3), toBytes(ext3))

            let smartNames = [[id1, name1, ext1], [id2, name2, ext2], [id3, name3, ext3]]
            let idx = 0
            smartNames.forEach(async function(smart){
                let id = smart[0]
              
                const result_getAdministrator = await smartNameRegistryInstance.getAdministratorOf(id)
                const result_address = result_getAdministrator[0]
                const result_nbSmartName = result_getAdministrator[1]
                const result_wallet = result_getAdministrator[2]
    
                assert.equal(result_address, administrator, 'The address of the administrator is not correct')
                assert.equal(result_nbSmartName, 3, 'The number of smart names is not correct')
                assert.equal(result_wallet[idx], id, 'The id of smart name is not correct')
                idx++;
            }) 
        })

        it("Get administrator by address", async() => {
            await smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1))
            await smartNameRegistryInstance.register(toBytes(name2), toBytes(ext2))

            const result_getAdministrator = await smartNameRegistryInstance.getAdministratorByAddress(administrator)
            const result_address = result_getAdministrator[0]
            const result_nbSmartName = result_getAdministrator[1]
            const result_wallet = result_getAdministrator[2]

            assert.equal(result_address, administrator, 'The address of the administrator is not correct')
            assert.equal(result_nbSmartName, 2, 'The number of the smart names is not correct')
            assert.equal(result_wallet[0], id1, 'The id of the smart name is not correct')
            assert.equal(result_wallet[1], id2, 'The id of the smart name is not correct')
        })  

        it("Get administrator of smart name which not exist", async() => {
            await catchRevert(smartNameRegistryInstance.getAdministratorOf(id1))
        })  

        it("Get administrator by address which not exist", async() => {
            await catchRevert(smartNameRegistryInstance.getAdministratorByAddress(user))
        })  
    })

    describe("GetSmartName()", async() => { 

        it("Get smart name", async() => {
            await smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1))
            const result_getSmartName = await smartNameRegistryInstance.getSmartName(id1)

            const result_id = result_getSmartName[0]
            const result_nameaddress = result_getSmartName[1]
            const result_name = result_getSmartName[2]
            const result_ext = result_getSmartName[3]
            const result_administrator_addr = result_getSmartName[4]
            const result_record = result_getSmartName[5]

            assert.equal(result_id, id1, 'The id of the smart name is not correct')
            assert.equal(toAscii(result_name), name1, 'The name of the smart name is not correct')
            assert.equal(toAscii(result_ext), ext1, 'The extension of the smart name is not correct')
            assert.equal(result_administrator_addr, administrator, 'The administrator of the smart name is not correct')
            assert.equal(result_record, administrator, 'The record of the smart name is not correct')
        }) 

        it("Get several smart names", async() => {

            await smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1))
            await smartNameRegistryInstance.register(toBytes(name2), toBytes(ext2))
            await smartNameRegistryInstance.register(toBytes(name3), toBytes(ext3))

            let smartNames = [[id1, name1, ext1], [id2, name2, ext2], [id3, name3, ext3]]
            smartNames.forEach(async function(smart){
                let id = smart[0]
                let name = smart[1]
                let ext = smart[2]

                let result_getSmartName = await smartNameRegistryInstance.getSmartName(id)

                let result_id = result_getSmartName[0]
                let result_nameaddress = result_getSmartName[1]
                let result_name = result_getSmartName[2]
                let result_ext = result_getSmartName[3]
                let result_administrator_addr = result_getSmartName[4]
                let result_record = result_getSmartName[5]
    
                assert.equal(result_id, id, 'The id of the smart name is not correct')
                assert.equal(toAscii(result_name), name, 'The name of the smart name is not correct')
                assert.equal(toAscii(result_ext), ext, 'The extension of the smart name is not correct')
                assert.equal(result_administrator_addr, administrator, 'The administrator of the smart name is not correct')
                assert.equal(result_record, administrator, 'The record of the smart name is not correct')
            }) 
        })

        it("Get smart name which not exist", async() => {
            await catchRevert(smartNameRegistryInstance.getSmartName(id1))
        }) 

        it("Get smart name with bad format", async() => {
            await catchRevert(smartNameRegistryInstance.getSmartName(id1))
        }) 
    })
    
    describe("GetNbSmartNamesTotal()", async() => { 
        
        it("Get number of smart names registered", async() => {
         
            const nbSmartNames_before = await smartNameRegistryInstance.getNbSmartNamesTotal()
            await smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1))
            await smartNameRegistryInstance.register(toBytes(name2), toBytes(ext2))
            await smartNameRegistryInstance.register(toBytes(name3), toBytes(ext3))
            const nbSmartNames_after = await smartNameRegistryInstance.getNbSmartNamesTotal()

            assert.equal(nbSmartNames_before, 0, 'The number of smart names is not correct')
            assert.equal(nbSmartNames_after, 3, 'The number of smart names is not correct')
        }) 
    })


})