var SmartNameLibrary = artifacts.require("./utils/SmartNameLibrary.sol");
var SmartNameRegistry = artifacts.require("./registry/SmartNameRegistry.sol");
var SmartNameResolver = artifacts.require("./services/resolver/SmartNameResolver.sol");
var SmartNameMarket = artifacts.require("./services/market/SmartNameMarket.sol");
var SmartNameBanking = artifacts.require("./services/banking/SmartNameBanking.sol");

module.exports = function(deployer) {

  deployer.then(async () => {
    await deployer.deploy(SmartNameLibrary)
    await deployer.link(SmartNameLibrary, SmartNameRegistry);

    let SmartNameRegistryInstance = await deployer.deploy(SmartNameRegistry);
    
    await deployer.deploy(SmartNameResolver, SmartNameRegistryInstance.address);
    await deployer.deploy(SmartNameMarket, SmartNameRegistryInstance.address);
    await deployer.deploy(SmartNameBanking, SmartNameRegistryInstance.address);
  })
};
