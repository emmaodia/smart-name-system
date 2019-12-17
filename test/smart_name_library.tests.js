/*


This test file has been updated for Truffle version 5.0. If your tests are failing, make sure that you are
using Truffle version 5.0. You can check this by running "truffle version"  in the terminal. If version 5 is not
installed, you can uninstall the existing version with `npm uninstall -g truffle` and install the latest version (5.0)
with `npm install -g truffle`.

*/
let SmartNameLibrary = artifacts.require('SmartNameLibrary')

let toAscii = function(input) { return web3.utils.toAscii(input).replace(/\u0000/g, '') }
let toBytes = function(input) { return web3.utils.fromAscii(input) }

contract('SmartNameLibrary', function(accounts) {

    const name1 = 'name';
    const ext1 = 'ext';
    const id1 = '0xac098044d08b519e4349f07a1c30d6e0b89cb69193face8a13eaee44fd8ceb31';

    let smartNameLibraryInstance

    beforeEach(async () => {
        smartNameLibraryInstance = await SmartNameLibrary.new()
    })

    describe("GetIdOf()", async() => { 
        
        it("Get id of a smart name", async() => {
            const result_id = await smartNameLibraryInstance.getIdOf(toBytes(name1), toBytes(ext1))
            assert.equal(result_id, id1, 'The id of the smart name is not correct')
        }) 
    })
})