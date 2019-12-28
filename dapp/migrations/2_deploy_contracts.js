var SmartNameLibrary = artifacts.require("./utils/SmartNameLibrary.sol")
var SmartNameRegistry = artifacts.require("./registry/SmartNameRegistry.sol")
var SmartNameResolver = artifacts.require("./services/resolver/SmartNameResolver.sol")
var SmartNameMarket = artifacts.require("./services/market/SmartNameMarket.sol")
var SmartNameBanking = artifacts.require("./services/banking/SmartNameBanking.sol")

module.exports = function(deployer) {

  deployer.then(async () => {
    // Library
    await deployer.deploy(SmartNameLibrary)
    // Link Registry and Library
    await deployer.link(SmartNameLibrary, SmartNameRegistry)
    // Registry
    let SmartNameRegistryInstance = await deployer.deploy(SmartNameRegistry)
    // Resolver
    await deployer.deploy(SmartNameResolver, SmartNameRegistryInstance.address)
    // Market
    await deployer.deploy(SmartNameMarket, SmartNameRegistryInstance.address)
    // Banking
    await deployer.deploy(SmartNameBanking, SmartNameRegistryInstance.address)
  })
}
