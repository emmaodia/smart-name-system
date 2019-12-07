/*

The public version of the file used for testing can be found here: https://gist.github.com/ConsenSys-Academy/7d59ba6ebe581c1ffcc981469e226c6e

This test file has been updated for Truffle version 5.0. If your tests are failing, make sure that you are
using Truffle version 5.0. You can check this by running "truffle version"  in the terminal. If version 5 is not
installed, you can uninstall the existing version with `npm uninstall -g truffle` and install the latest version (5.0)
with `npm install -g truffle`.

*/

let DomainNameRegistry = artifacts.require('DomainNameRegistry')
let catchRevert = require("./exceptionsHelpers.js").catchRevert

let toAscii = function(input) { return web3.utils.toAscii(input).replace(/\u0000/g, '') }
let toBytes = function(input) { return web3.utils.fromAscii(input) }

contract('DomainName', function(accounts) {

    const administrator = accounts[0]
    const user1 = accounts[1]
    const user2 = accounts[2]

    const record1 = accounts[3];
    const emptyRecord = '0x0000000000000000000000000000000000000000'

    const emptyAddress = '0x0000000000000000000000000000000000000000'
    const incorrectAddress = 'ImNotAnAdress'

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

    const bad_name = '';
    const bad_ext = '';
    const bad_id = 'Iamnotanid';

    let instance

    beforeEach(async () => {
        instance = await DomainNameRegistry.new()
    })

    describe("Register()", async() => {

        it("Register a domain name", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            const result_getDomainName = await instance.getDomainNameOf(toBytes(name1), toBytes(ext1))

            const result_id = result_getDomainName[0]
            const result_name = result_getDomainName[1]
            const result_ext = result_getDomainName[2]
            const result_administrator_addr = result_getDomainName[3]
            const result_record = result_getDomainName[4]

            assert.equal(result_id, id1, 'The id of the domain name is not correct')
            assert.equal(toAscii(result_name), name1, 'The name of the domain name is not correct')
            assert.equal(toAscii(result_ext), ext1, 'The extension of the domain name is not correct')
            assert.equal(result_administrator_addr, administrator, 'The administrator of the domain name is not correct')
            assert.equal(result_record, administrator, 'The record of the domain name is not correct')

            const result_getAdministrator = await instance.getAdministratorOf(toBytes(name1), toBytes(ext1))
            const result_address = result_getAdministrator[0]
            const result_nbDomainName = result_getAdministrator[1]
            const result_wallet = result_getAdministrator[2]

            assert.equal(result_address, administrator, 'The address of the administrator is not correct')
            assert.equal(result_nbDomainName, 1, 'The number of domain names is not correct')
            assert.equal(result_wallet[0], id1, 'The id of domain name is not correct')
        })    

        it("Register several domain names", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await instance.register(toBytes(name2), toBytes(ext2))
            await instance.register(toBytes(name3), toBytes(ext3))

            let domainNames = [[id1, name1, ext1], [id2, name2, ext2], [id3, name3, ext3]]
            let idx = 0
            domainNames.forEach(async function(domain){
                let id = domain[0]
                let name = domain[1]
                let ext = domain[2]

                let result_getDomainName = await instance.getDomainNameOf(toBytes(name), toBytes(ext))

                let result_id = result_getDomainName[0]
                let result_name = result_getDomainName[1]
                let result_ext = result_getDomainName[2]
                let result_administrator_addr = result_getDomainName[3]
                let result_record = result_getDomainName[4]
    
                assert.equal(result_id, id, 'The id of the domain name is not correct')
                assert.equal(toAscii(result_name), name, 'The name of the domain name is not correct')
                assert.equal(toAscii(result_ext), ext, 'The extension of the domain name is not correct')
                assert.equal(result_administrator_addr, administrator, 'The administrator of the domain name is not correct')
                assert.equal(result_record, administrator, 'The record of the domain name is not correct')
    
                const result_getAdministrator = await instance.getAdministratorOf(toBytes(name), toBytes(ext))
                const result_address = result_getAdministrator[0]
                const result_nbDomainName = result_getAdministrator[1]
                const result_wallet = result_getAdministrator[2]
    
                assert.equal(result_address, administrator, 'The address of the administrator is not correct')
                assert.equal(result_nbDomainName, 3, 'The number of domain names is not correct')
                assert.equal(result_wallet[idx], id, 'The id of domain name is not correct')
                idx++;
            }) 

        })
        
        it("Prevent to register a domain name with bad format", async() => {
            await catchRevert(instance.register(toBytes(bad_name), toBytes(ext1)))
            await catchRevert(instance.register(toBytes(name1), toBytes(bad_ext)))
            await catchRevert(instance.register(toBytes(bad_name), toBytes(bad_ext)))
        })
                
        it("Prevent to register a domain already registered", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await catchRevert(instance.register(toBytes(name1), toBytes(ext1)))
        })

    })

    describe("Abandon()", async() => { 

        it("Abandon a domain name", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await instance.abandon(toBytes(name1), toBytes(ext1))

            await catchRevert(instance.getDomainNameOf(toBytes(name1), toBytes(ext1)))
            await catchRevert(instance.getAdministratorOf(toBytes(name1), toBytes(ext1)))
            await catchRevert(instance.getAdministratorByAddress(administrator))

    
        })

        it("Abandon a domain name among several", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await instance.register(toBytes(name2), toBytes(ext2))
            await instance.register(toBytes(name3), toBytes(ext3))

            await instance.abandon(toBytes(name1), toBytes(ext1))

            await catchRevert(instance.getDomainNameOf(toBytes(name1), toBytes(ext1)))
            await catchRevert(instance.getAdministratorOf(toBytes(name1), toBytes(ext1)))

            const result_getAdministrator = await instance.getAdministratorByAddress(administrator)
            const result_address = result_getAdministrator[0]
            const result_nbDomainName = result_getAdministrator[1]
            const result_wallet = result_getAdministrator[2]

            assert.equal(result_address, administrator, 'The address of the administrator is not correct')
            assert.equal(result_nbDomainName, 2, 'The number of domain names is not correct')
            assert.equal(result_wallet[0], emptyId, 'The id of domain name is not deleted of the wallet')
        })

        // Abandon incorrect name
        it("Prevent to abandon a domain name which doesn't exist", async() => {
            await catchRevert(instance.abandon(toBytes(name1), toBytes(ext1)))
         })

        // Abandon name not admin 

        it("Prevent to abandon a domain name if the caller is not the administrator", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await instance.modifyAdministrator(toBytes(name1), toBytes(ext1), user1)
            await catchRevert(instance.abandon(toBytes(name2), toBytes(ext2)))
         })

    })


    describe("ModifyAdministrator()", async() => { 

        // Good
        it("Modify the administrator of a domain name", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await instance.register(toBytes(name2), toBytes(ext2))

            await instance.modifyAdministrator(toBytes(name1), toBytes(ext1),user1)

            // Domain name
            const result_getDomainName = await instance.getDomainNameOf(toBytes(name1), toBytes(ext1))

            const result_id = result_getDomainName[0]
            const result_name = result_getDomainName[1]
            const result_ext = result_getDomainName[2]
            const result_administrator_addr = result_getDomainName[3]
            const result_record = result_getDomainName[4]

            assert.equal(result_id, id1, 'The id of the domain name is not correct')
            assert.equal(toAscii(result_name), name1, 'The name of the domain name is not correct')
            assert.equal(toAscii(result_ext), ext1, 'The extension of the domain name is not correct')
            assert.equal(result_administrator_addr, user1, 'The administrator of the domain name is not correct')
            assert.equal(result_record, user1, 'The record of the domain name is not correct')
            
            // New admin
            const result_getAdministrator = await instance.getAdministratorOf(toBytes(name1), toBytes(ext1))
            const result_address = result_getAdministrator[0]
            const result_nbDomainName = result_getAdministrator[1]
            const result_wallet = result_getAdministrator[2]

            assert.equal(result_address, user1, 'The address of the administrator is not correct')
            assert.equal(result_nbDomainName, 1, 'The number of domain names is not correct')
            assert.equal(result_wallet[0], id1, 'The id of domain name is not correct')

            // old admin is deleted
            const result_getOldAdministrator = await instance.getAdministratorByAddress(administrator)
            const result_oldAddress = result_getOldAdministrator[0]
            const result_oldNbDomainName = result_getOldAdministrator[1]
            const result_oldWallet = result_getOldAdministrator[2]

            assert.equal(result_oldAddress, administrator, 'The address of the old administrator is not correct')
            assert.equal(result_oldNbDomainName, 1, 'The number of domain names of the old administrator is not correct')
            assert.equal(result_oldWallet[0], emptyId, 'The domain name of the old administrator not abandon')

         })

        it("Prevent to modify the administrator of a domain name which doesn't exist", async() => {
            await catchRevert(instance.modifyAdministrator(toBytes(name1), toBytes(ext1), user1))
         })

        it("Prevent to modify the administrator of a domain name with empty address", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await catchRevert(instance.modifyAdministrator(toBytes(name1), toBytes(ext1), emptyAddress))
        })

        it("Prevent to modify the administrator of a domain name with the same administrator", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await catchRevert(instance.modifyAdministrator(toBytes(name1), toBytes(ext1), administrator))
        })

        it("Prevent to modify the administrator if the caller is not the administrator of the domain name", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await instance.modifyAdministrator(toBytes(name1), toBytes(ext1), user1)
            await catchRevert(instance.modifyAdministrator(toBytes(name1), toBytes(ext1), administrator))
        })
    })

    describe("ModifyRecord()", async() => { 

         // Good
         it("Modify the record of a domain name", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await instance.modifyRecord(toBytes(name1), toBytes(ext1), record1)

            // Domain name
            const result_getDomainName = await instance.getDomainNameOf(toBytes(name1), toBytes(ext1))

            const result_id = result_getDomainName[0]
            const result_name = result_getDomainName[1]
            const result_ext = result_getDomainName[2]
            const result_administrator_addr = result_getDomainName[3]
            const result_record = result_getDomainName[4]

            assert.equal(result_id, id1, 'The id of the domain name is not correct')
            assert.equal(toAscii(result_name), name1, 'The name of the domain name is not correct')
            assert.equal(toAscii(result_ext), ext1, 'The extension of the domain name is not correct')
            assert.equal(result_administrator_addr, administrator, 'The administrator of the domain name is not correct')
            assert.equal(result_record, record1, 'The record of the domain name is not correct')

         })


        it("Prevent to modify the administrator of a domain name which doesn't exist", async() => {
            await catchRevert(instance.modifyRecord(toBytes(name1), toBytes(ext1), record1))
         })

        it("Prevent to modify the record of a domain name with empty address", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await catchRevert(instance.modifyAdministrator(toBytes(name1), toBytes(ext1), emptyRecord))
        })

        it("Prevent to modify the record of a domain name with the same record", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await catchRevert(instance.modifyAdministrator(toBytes(name1), toBytes(ext1), administrator))
        })

        it("Prevent to modify the record if the caller is not the administrator of the domain name", async() => {
            await instance.register(toBytes(name1), toBytes(ext1))
            await instance.modifyAdministrator(toBytes(name1), toBytes(ext1), user1)
            await catchRevert(instance.modifyAdministrator(toBytes(name1), toBytes(ext1), record1))
        })

    })

    describe("getWallet()", async() => { 

        // my wallet

        // Wallet of user

        // Wrong admin

    })

    describe("GetAdministrator()", async() => { 

        // my wallet

        // Wallet of user

        // Wrong admin

    })

    describe("GetDomainName()", async() => { 

        // my wallet

        // Wallet of user

        // Wrong admin

    })

    describe("GetNbDomainNamesTotal()", async() => { 

        // my wallet

        // Wallet of user

        // Wrong admin

    })


})