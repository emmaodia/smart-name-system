/*


This test file has been updated for Truffle version 5.0. If your tests are failing, make sure that you are
using Truffle version 5.0. You can check this by running "truffle version"  in the terminal. If version 5 is not
installed, you can uninstall the existing version with `npm uninstall -g truffle` and install the latest version (5.0)
with `npm install -g truffle`.

*/

let SmartNameRegistry = artifacts.require('SmartNameRegistry')
let SmartNameBanking = artifacts.require('SmartNameBanking')

let catchRevert = require("./exceptionsHelpers.js").catchRevert

let toAscii = function(input) { return web3.utils.toAscii(input).replace(/\u0000/g, '') }
let toBytes = function(input) { return web3.utils.fromAscii(input) }

contract('SmartNameResolver', function(accounts) {

    const administrator = accounts[0]
    const user = accounts[1]

    const name1 = 'name';
    const ext1 = 'ext';
    const id1 = '0xac098044d08b519e4349f07a1c30d6e0b89cb69193face8a13eaee44fd8ceb31';

    const name2 = 'name2';
    const ext2 = 'ext2';
    const id2 = '0xb5060c27c60ff9b53a8c21bd133eccebbd2b1a61730bdb59f3d80763d0e415dd';

    let smartNameRegistryInstance
    let smartNameBankingInstance

    beforeEach(async () => {

		smartNameRegistryInstance = await SmartNameRegistry.new()
		smartNameBankingInstance = await SmartNameBanking.new(smartNameRegistryInstance.address)
	
        await smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1))
    })

    describe("Send()", async() => { 
        
        it("Send ether to smart name", async() => {
            await smartNameBankingInstance.send(toBytes(name1), toBytes(ext1), {from : administrator, value: 10})
            await smartNameBankingInstance.send(toBytes(name1), toBytes(ext1), {from : user, value: 10})
        }) 

        it("Send ether to smart name by id", async() => {
            await smartNameBankingInstance.sendById(id1, {from : administrator, value: 10})
            await smartNameBankingInstance.sendById(id1, {from : user, value: 10})
        }) 
        it("Send ether to smart name which not exists", async() => {
            await catchRevert(smartNameBankingInstance.sendById(id2), {from : administrator, value: 10})
        }) 
    })
})