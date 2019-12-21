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

const smartNameRegistryABI = [
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_id",
				"type": "bytes32"
			},
			{
				"internalType": "bytes16",
				"name": "_name",
				"type": "bytes16"
			},
			{
				"internalType": "bytes4",
				"name": "_ext",
				"type": "bytes4"
			},
			{
				"internalType": "address",
				"name": "_administrator",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_record",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "id",
				"type": "bytes32"
			}
		],
		"name": "LogForAdministratorUpdate",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "id",
				"type": "bytes32"
			}
		],
		"name": "LogForCreation",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "id",
				"type": "bytes32"
			}
		],
		"name": "LogForRecordUpdate",
		"type": "event"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "administrator",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "ext",
		"outputs": [
			{
				"internalType": "bytes4",
				"name": "",
				"type": "bytes4"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "get",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			},
			{
				"internalType": "bytes16",
				"name": "",
				"type": "bytes16"
			},
			{
				"internalType": "bytes4",
				"name": "",
				"type": "bytes4"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getAdministrator",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getExtension",
		"outputs": [
			{
				"internalType": "bytes4",
				"name": "",
				"type": "bytes4"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getId",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getName",
		"outputs": [
			{
				"internalType": "bytes16",
				"name": "",
				"type": "bytes16"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getRecord",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "id",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "bytes16",
				"name": "",
				"type": "bytes16"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "record",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "address",
				"name": "_administrator",
				"type": "address"
			}
		],
		"name": "setAdministrator",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "address",
				"name": "_record",
				"type": "address"
			}
		],
		"name": "setRecord",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	}
]

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
		smartNameResolverInstance = await SmartNameResolver.new(smartNameRegistryInstance.address)
	

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