/* Tests for SmartName contract */

let SmartName = artifacts.require('SmartName')

let catchRevert = require("../../exceptionsHelpers.js").catchRevert

let toAscii = function(input) { return web3.utils.toAscii(input).replace(/\u0000/g, '') }
let toBytes = function(input) { return web3.utils.fromAscii(input) }

contract('SmartName', function(accounts) {

    const administrator = accounts[0]
    const user = accounts[1]
 
    const record = accounts[3]

    const emptyName = ''
    const emptyExt = ''

    const name1 = 'name'
    const ext1 = 'ext'
    const id1 = '0xac098044d08b519e4349f07a1c30d6e0b89cb69193face8a13eaee44fd8ceb31'

    const name2 = 'name2'
    const ext2 = 'ext2'
    const id2 = '0xb5060c27c60ff9b53a8c21bd133eccebbd2b1a61730bdb59f3d80763d0e415dd'
    
    let smartNameInstance

    beforeEach(async () => {
        // Deploiement
        smartNameInstance = await SmartName.new(id1, toBytes(name1), toBytes(ext1), administrator, record)
    })

    describe("Creation", async() => {

        it("Create a smart name", async() => {
            await SmartName.new(id2, toBytes(name2), toBytes(ext2), administrator, record)
        })    

        it("Create several smart names", async() => {
            await SmartName.new(id1, toBytes(name1), toBytes(ext1), administrator, record)
            await SmartName.new(id1, toBytes(name1), toBytes(ext1), administrator, record)
            await SmartName.new(id2, toBytes(name2), toBytes(ext2), administrator, record)
        })

        it("Create several with bad name and extension", async() => {
            await catchRevert(SmartName.new(id1, toBytes(emptyName), toBytes(emptyExt), administrator, record))
            await catchRevert(SmartName.new(id1, toBytes(name1), toBytes(emptyExt), administrator, record))
            await catchRevert(SmartName.new(id1, toBytes(emptyName), toBytes(emptyExt), administrator, record))
        })
    })

    describe("Setters", async() => {

        it("SetAdministrator()", async() => {
            await smartNameInstance.setAdministrator(user)
            
            let result = await smartNameInstance.getAdministrator()
            
            assert.equal(result, user, 'The address of the administrator is not correct')
        })

        it("SetRecord", async() => {
            await smartNameInstance.setRecord(user)
            
            let result = await smartNameInstance.getRecord()
            
            assert.equal(result, user, 'The record is not correct')
        })
    })

    describe("Getters", async() => {

        it("Get()", async() => {
            let smartName = await smartNameInstance.get()
            
            assert.equal(smartName[0], id1, 'The id is not correct')
            assert.equal(toAscii(smartName[1]), name1, 'The name is not correct')
            assert.equal(toAscii(smartName[2]), ext1, 'The extension is not correct')
            assert.equal(smartName[3], administrator, 'The address of the administrator is not correct')
            assert.equal(smartName[4], record, 'The record is not correct')
        })

        it("GetId()", async() => {
            assert.equal(await smartNameInstance.getId(), id1, 'The id is not correct')
        })

        it("GetName()", async() => {
            assert.equal(toAscii(await smartNameInstance.getName()), name1, 'The name is not correct')
        })

        it("GetName()", async() => {
            assert.equal(toAscii(await smartNameInstance.getExtension()), ext1, 'The extension is not correct')
        })

        it("GetAdministrator()", async() => {
            assert.equal(await smartNameInstance.getAdministrator(), administrator, 'The administrator is not correct')
        })

        it("GetRecord()", async() => {
            assert.equal(await smartNameInstance.getRecord(), record, 'The record is not correct')
        })
    })
})