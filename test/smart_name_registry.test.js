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
    const emptyRecord = '0x0000000000000000000000000000000000000000'
    const emptyName = '';
    const emptyExt = '';

    const emptyAddress = '0x0000000000000000000000000000000000000000'
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

    let instance

    beforeEach(async () => {
        instance = await SmartNameRegistry.new()
    })

    describe("Register()", async() => {

        it("Register a smart name", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            const result_getSmartName = await instance.getSmartNameOf(toBytes(name1), toBytes(ext1))

            const result_id = result_getSmartName[0]
            const result_name = result_getSmartName[1]
            const result_ext = result_getSmartName[2]
            const result_administrator_addr = result_getSmartName[3]
            const result_record = result_getSmartName[4]

            assert.equal(result_id, id1, 'The id of the smart name is not correct')
            assert.equal(toAscii(result_name), name1, 'The name of the smart name is not correct')
            assert.equal(toAscii(result_ext), ext1, 'The extension of the smart name is not correct')
            assert.equal(result_administrator_addr, administrator, 'The administrator of the smart name is not correct')
            assert.equal(result_record, administrator, 'The record of the smart name is not correct')

            const result_getAdministrator = await instance.getAdministratorOf(toBytes(name1), toBytes(ext1))
            const result_address = result_getAdministrator[0]
            const result_nbSmartName = result_getAdministrator[1]
            const result_wallet = result_getAdministrator[2]

            assert.equal(result_address, administrator, 'The address of the administrator is not correct')
            assert.equal(result_nbSmartName, 1, 'The number of smart names is not correct')
            assert.equal(result_wallet[0], id1, 'The id of smart name is not correct')
        })    

        it("Register several smart names", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await instance.register(toBytes(name2), toBytes(ext2))
            await instance.register(toBytes(name3), toBytes(ext3))

            let smartNames = [[id1, name1, ext1], [id2, name2, ext2], [id3, name3, ext3]]
            let idx = 0
            smartNames.forEach(async function(smart){
                let id = smart[0]
                let name = smart[1]
                let ext = smart[2]

                let result_getSmartName = await instance.getSmartNameOf(toBytes(name), toBytes(ext))

                let result_id = result_getSmartName[0]
                let result_name = result_getSmartName[1]
                let result_ext = result_getSmartName[2]
                let result_administrator_addr = result_getSmartName[3]
                let result_record = result_getSmartName[4]
    
                assert.equal(result_id, id, 'The id of the smart name is not correct')
                assert.equal(toAscii(result_name), name, 'The name of the smart name is not correct')
                assert.equal(toAscii(result_ext), ext, 'The extension of the smart name is not correct')
                assert.equal(result_administrator_addr, administrator, 'The administrator of the smart name is not correct')
                assert.equal(result_record, administrator, 'The record of the smart name is not correct')
    
                const result_getAdministrator = await instance.getAdministratorOf(toBytes(name), toBytes(ext))
                const result_address = result_getAdministrator[0]
                const result_nbSmartName = result_getAdministrator[1]
                const result_wallet = result_getAdministrator[2]
    
                assert.equal(result_address, administrator, 'The address of the administrator is not correct')
                assert.equal(result_nbSmartName, 3, 'The number of smart names is not correct')
                assert.equal(result_wallet[idx], id, 'The id of smart name is not correct')
                idx++;
            }) 

        })
        
        it("Register a smart name with bad format", async() => {
            await catchRevert(instance.register(toBytes(emptyName), toBytes(ext1)))
            await catchRevert(instance.register(toBytes(name1), toBytes(emptyExt)))
            await catchRevert(instance.register(toBytes(emptyName), toBytes(emptyExt)))
        })
                
        it("Register a smart already registered", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await catchRevert(instance.register(toBytes(name1), toBytes(ext1)))
        })

    })

    describe("Abandon()", async() => { 

        it("Abandon a smart name", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await instance.abandon(toBytes(name1), toBytes(ext1))

            await catchRevert(instance.getSmartNameOf(toBytes(name1), toBytes(ext1)))
            await catchRevert(instance.getAdministratorOf(toBytes(name1), toBytes(ext1)))
            await catchRevert(instance.getAdministratorByAddress(administrator))
        })

        it("Abandon a smart name among several", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await instance.register(toBytes(name2), toBytes(ext2))
            await instance.register(toBytes(name3), toBytes(ext3))

            await instance.abandon(toBytes(name1), toBytes(ext1))

            await catchRevert(instance.getSmartNameOf(toBytes(name1), toBytes(ext1)))
            await catchRevert(instance.getAdministratorOf(toBytes(name1), toBytes(ext1)))

            const result_getAdministrator = await instance.getAdministratorByAddress(administrator)
            const result_address = result_getAdministrator[0]
            const result_nbSmartName = result_getAdministrator[1]
            const result_wallet = result_getAdministrator[2]

            assert.equal(result_address, administrator, 'The address of the administrator is not correct')
            assert.equal(result_nbSmartName, 2, 'The number of smart names is not correct')
            assert.equal(result_wallet[0], emptyId, 'The id of smart name is not deleted of the wallet')
        })

        it("Prevent to abandon a smart name which doesn't exist", async() => {
            await catchRevert(instance.abandon(toBytes(name1), toBytes(ext1)))
         })

        it("Prevent to abandon a smart name if the caller is not the administrator", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await instance.modifyAdministrator(toBytes(name1), toBytes(ext1), user)
            await catchRevert(instance.abandon(toBytes(name2), toBytes(ext2)))
         })
    })


    describe("ModifyAdministrator()", async() => { 

        it("Modify the administrator of a smart name", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await instance.register(toBytes(name2), toBytes(ext2))

            await instance.modifyAdministrator(toBytes(name1), toBytes(ext1),user)

            const result_getSmartName = await instance.getSmartNameOf(toBytes(name1), toBytes(ext1))
            const result_administrator_addr = result_getSmartName[3]

            assert.equal(result_administrator_addr, user, 'The administrator of the smart name is not correct')

            const result_getAdministrator = await instance.getAdministratorOf(toBytes(name1), toBytes(ext1))
            const result_address = result_getAdministrator[0]
            const result_nbSmartName = result_getAdministrator[1]
            const result_wallet = result_getAdministrator[2]

            assert.equal(result_address, user, 'The address of the administrator is not correct')
            assert.equal(result_nbSmartName, 1, 'The number of smart names is not correct')
            assert.equal(result_wallet[0], id1, 'The id of smart name is not correct')

            const result_getOldAdministrator = await instance.getAdministratorByAddress(administrator)
            const result_oldAddress = result_getOldAdministrator[0]
            const result_oldNbSmartName = result_getOldAdministrator[1]
            const result_oldWallet = result_getOldAdministrator[2]

            assert.equal(result_oldAddress, administrator, 'The address of the old administrator is not correct')
            assert.equal(result_oldNbSmartName, 1, 'The number of smart names of the old administrator is not correct')
            assert.equal(result_oldWallet[0], emptyId, 'The smart name of the old administrator not abandon')

         })

        it("Modify the administrator of a smart name which doesn't exist", async() => {
            await catchRevert(instance.modifyAdministrator(toBytes(name1), toBytes(ext1), user))
         })

        it("Modify the administrator of a smart name with empty address", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await catchRevert(instance.modifyAdministrator(toBytes(name1), toBytes(ext1), emptyAddress))
        })

        it("Modify the administrator of a smart name with the same administrator", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await catchRevert(instance.modifyAdministrator(toBytes(name1), toBytes(ext1), administrator))
        })

        it("Modify the administrator if the caller is not the administrator of the smart name", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await instance.modifyAdministrator(toBytes(name1), toBytes(ext1), user)
            await catchRevert(instance.modifyAdministrator(toBytes(name1), toBytes(ext1), administrator))
        })
    })

    describe("ModifyRecord()", async() => { 

         it("Modify the record of a smart name", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await instance.modifyRecord(toBytes(name1), toBytes(ext1), record)

            const result_record = await instance.getRecordOf(toBytes(name1), toBytes(ext1))
            assert.equal(result_record, record, 'The record of the smart name is not correct')
         })


        it("Modify the administrator of a smart name which doesn't exist", async() => {
            await catchRevert(instance.modifyRecord(toBytes(name1), toBytes(ext1), record))
         })

        it("Modify the record of a smart name with empty address", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await catchRevert(instance.modifyAdministrator(toBytes(name1), toBytes(ext1), emptyRecord))
        })

        it("Modify the record of a smart name with the same record", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await catchRevert(instance.modifyAdministrator(toBytes(name1), toBytes(ext1), administrator))
        })

        it("Modify the record if the caller is not the administrator of the smart name", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await instance.modifyAdministrator(toBytes(name1), toBytes(ext1), user)
            await catchRevert(instance.modifyAdministrator(toBytes(name1), toBytes(ext1), record))
        })

    })

    describe("getWallet()", async() => { 

        it("Get wallet", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await instance.register(toBytes(name2), toBytes(ext2))
            await instance.register(toBytes(name3), toBytes(ext3))

            const result_getWallet = await instance.getWallet()

            const result_nb = result_getWallet[0]
            const result_wallet= result_getWallet[1]

            assert.equal(result_nb, 3, 'The number of smart names in the wallet is not correct')

            assert.equal(result_wallet[0], id1, 'The id of smart names in the wallet is not correct')
            assert.equal(result_wallet[1], id2, 'The id of smart names in the wallet is not correct')
            assert.equal(result_wallet[2], id3, 'The id of smart names in the wallet is not correct')
        }) 

        it("Get wallet by address", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await instance.register(toBytes(name2), toBytes(ext2))
            await instance.register(toBytes(name3), toBytes(ext3))

            const result_getWallet = await instance.getWalletOf(administrator)

            const result_nb = result_getWallet[0]
            const result_wallet= result_getWallet[1]

            assert.equal(result_nb, 3, 'The number of smart names in the in the wallet is not correct')

            assert.equal(result_wallet[0], id1, 'The id of smart names in the wallet is not correct')
            assert.equal(result_wallet[1], id2, 'The id of smart names in the wallet is not correct')
            assert.equal(result_wallet[2], id3, 'The id of smart names in the wallet is not correct')
        }) 

        it("Get wallet of a no administrator", async() => {
            await catchRevert(instance.getWalletOf(user));
        }) 
    })

    describe("getRecord()", async() => { 
        it("Get record of a smart name", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))

            const result_record = await instance.getRecordOf(toBytes(name1), toBytes(ext1))
         
            assert.equal(result_record, administrator, 'The record of the smart name is not correct')
        }) 

        it("Get wallet of a smart name by id", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))

            const result_record = await instance.getRecordById(id1)
    
            assert.equal(result_record, administrator, 'The record of the smart name is not correct')
        }) 

        it("Get wallet of a smart name with bad format", async() => {
            await catchRevert(instance.getRecordOf(toBytes(emptyName), toBytes(emptyExt)))
        }) 

        it("Get wallet of a smart name which not exist", async() => {
            await catchRevert(instance.getRecordOf(toBytes(name1), toBytes(ext1)))
        })

        it("Get wallet of a smart name by empty id", async() => {
            await catchRevert(instance.getRecordById(emptyId))
        }) 

        it("Get wallet of a smart name by id which not exist", async() => {
            await catchRevert(instance.getRecordById(id1))
        }) 
    })

    describe("GetAdministrator()", async() => { 

        it("Get administrator", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await instance.register(toBytes(name2), toBytes(ext2))

            const result_getAdministrator = await instance.getAdministrator()
            const result_address = result_getAdministrator[0]
            const result_nbSmartName = result_getAdministrator[1]
            const result_wallet = result_getAdministrator[2]

            assert.equal(result_address, administrator, 'The address of the administrator is not correct')
            assert.equal(result_nbSmartName, 2, 'The number of the smart names is not correct')
            assert.equal(result_wallet[0], id1, 'The id of the smart name is not correct')
            assert.equal(result_wallet[1], id2, 'The id of the smart name is not correct')
        }) 

        it("Get administrator of a smart name", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await instance.register(toBytes(name2), toBytes(ext2))

            const result_getAdministrator = await instance.getAdministratorOf(toBytes(name1), toBytes(ext1))
            const result_address = result_getAdministrator[0]
            const result_nbSmartName = result_getAdministrator[1]
            const result_wallet = result_getAdministrator[2]

            assert.equal(result_address, administrator, 'The address of the administrator is not correct')
            assert.equal(result_nbSmartName, 2, 'The number of smart names is not correct')
            assert.equal(result_wallet[0], id1, 'The id of the smart name is not correct')
            assert.equal(result_wallet[1], id2, 'The id of the smart name is not correct')
        })    

        it("Get administrator by address", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await instance.register(toBytes(name2), toBytes(ext2))

            const result_getAdministrator = await instance.getAdministratorByAddress(administrator)
            const result_address = result_getAdministrator[0]
            const result_nbSmartName = result_getAdministrator[1]
            const result_wallet = result_getAdministrator[2]

            assert.equal(result_address, administrator, 'The address of the administrator is not correct')
            assert.equal(result_nbSmartName, 2, 'The number of the smart names is not correct')
            assert.equal(result_wallet[0], id1, 'The id of the smart name is not correct')
            assert.equal(result_wallet[1], id2, 'The id of the smart name is not correct')
        })  

        it("Get administrator of smart name which not exist", async() => {
            await catchRevert(instance.getAdministratorOf(toBytes(name1), toBytes(ext1)))
        })  

        it("Get administrator by address which not exist", async() => {
            await catchRevert(instance.getAdministratorByAddress(user))
        })  

        it("Get administrator with empty address", async() => {
            await catchRevert(instance.getAdministratorByAddress(emptyAddress))
        })  

        it("Get administrator by smart name with bad format", async() => {
            await catchRevert(instance.getAdministratorOf(toBytes(emptyName), toBytes(emptyExt)))
        })  
    })

    describe("GetSmartName()", async() => { 

        it("Get smart name by name and extension", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            const result_getSmartName = await instance.getSmartNameOf(toBytes(name1), toBytes(ext1))

            const result_id = result_getSmartName[0]
            const result_name = result_getSmartName[1]
            const result_ext = result_getSmartName[2]
            const result_administrator_addr = result_getSmartName[3]
            const result_record = result_getSmartName[4]

            assert.equal(result_id, id1, 'The id of the smart name is not correct')
            assert.equal(toAscii(result_name), name1, 'The name of the smart name is not correct')
            assert.equal(toAscii(result_ext), ext1, 'The extension of the smart name is not correct')
            assert.equal(result_administrator_addr, administrator, 'The administrator of the smart name is not correct')
            assert.equal(result_record, administrator, 'The record of the smart name is not correct')
        }) 

        it("Get smart name by id", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            const result_getSmartName = await instance.getSmartNameById(id1)

            const result_id = result_getSmartName[0]
            const result_name = result_getSmartName[1]
            const result_ext = result_getSmartName[2]
            const result_administrator_addr = result_getSmartName[3]
            const result_record = result_getSmartName[4]

            assert.equal(result_id, id1, 'The id of the smart name is not correct')
            assert.equal(toAscii(result_name), name1, 'The name of the smart name is not correct')
            assert.equal(toAscii(result_ext), ext1, 'The extension of the smart name is not correct')
            assert.equal(result_administrator_addr, administrator, 'The administrator of the smart name is not correct')
            assert.equal(result_record, administrator, 'The record of the smart name is not correct')
        }) 

        it("Get smart name which not exist", async() => {
            await catchRevert(instance.getSmartNameOf(toBytes(name1), toBytes(ext1)))
        }) 

        it("Get smart name by id which not exist", async() => {
            await catchRevert(instance.getSmartNameById(id1))
        }) 

        it("Get smart name with bad format", async() => {
            await catchRevert(instance.getSmartNameOf(toBytes(emptyName), toBytes(emptyExt)))
        }) 

    })

    describe("GetIdOfSmartName()", async() => { 
        
        it("Get id of a smart name", async() => {
            const result_id = await instance.getIdOfSmartName(toBytes(name1), toBytes(ext1))
            assert.equal(result_id, id1, 'The id of the smart name is not correct')
        }) 
        it("Get id of a smart name with bad format", async() => {
            await catchRevert(instance.getIdOfSmartName(toBytes(emptyName), toBytes(emptyExt)))
        }) 
    })

    describe("GetNbSmartNamesTotal()", async() => { 
        
        it("Get number of smart names registered", async() => {
         
            const nbSmartNames_before = await instance.getNbSmartNamesTotal()
            await instance.register(toBytes(name1), toBytes(ext1))
            await instance.register(toBytes(name2), toBytes(ext2))
            await instance.register(toBytes(name3), toBytes(ext3))
            const nbSmartNames_after = await instance.getNbSmartNamesTotal()

            assert.equal(nbSmartNames_before, 0, 'The number of smart names is not correct')
            assert.equal(nbSmartNames_after, 3, 'The number of smart names is not correct')
        }) 
    })


})