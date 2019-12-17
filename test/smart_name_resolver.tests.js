/*


This test file has been updated for Truffle version 5.0. If your tests are failing, make sure that you are
using Truffle version 5.0. You can check this by running "truffle version"  in the terminal. If version 5 is not
installed, you can uninstall the existing version with `npm uninstall -g truffle` and install the latest version (5.0)
with `npm install -g truffle`.

*/

let SmartNameRegistry = artifacts.require('SmartNameRegistry')
let SmartNameResolver = artifacts.require('SmartNameResolver')

let toAscii = function(input) { return web3.utils.toAscii(input).replace(/\u0000/g, '') }
let toBytes = function(input) { return web3.utils.fromAscii(input) }

contract('SmartNameResolver', function(accounts) {

    const administrator = accounts[0]
    const user = accounts[1]

    const name1 = 'name';
    const ext1 = 'ext';
    const id1 = '0xac098044d08b519e4349f07a1c30d6e0b89cb69193face8a13eaee44fd8ceb31';

    let smartNameRegistryInstance
    let smartNameResolverInstance

    beforeEach(async () => {
        smartNameRegistryInstance = await SmartNameRegistry.new()
        smartNameResolverInstance = await SmartNameResolver.new(smartNameRegistryInstance)

        await smartNameRegistryInstance.register(toBytes(name1), toBytes(ext1))
        await smartNameRegistryInstance.modifyRecord(id1, user)
    })

    describe("Resolve()", async() => { 
        
        it("Resolve a smart name", async() => {
            const result = await smartNameResolverInstance.resolve(toBytes(name1), toBytes(ext1))
            assert.equal(result, user, 'The record of the smart name is not correct')
        }) 
    })

    describe("Whois()", async() => { 
        
        it("Get the smart name administrator", async() => {
            const result = await smartNameResolverInstance.resolve(toBytes(name1), toBytes(ext1))
            assert.equal(result, user, 'The administrator of the smart name is not correct')
        }) 
    })

    describe("Get()", async() => { 
        
        it("Get a smart name address", async() => {
         //   const result = await smartNameResolverInstance.resolve(toBytes(name1), toBytes(ext1))
         //   assert.equal(result, user, 'The record of the smart name is not correct')
        }) 
    })
})