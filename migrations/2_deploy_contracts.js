var SmartNameLibrary = artifacts.require("./utils/SmartNameLibrary.sol");
var SmartNameRegistry = artifacts.require("./registry/SmartNameRegistry.sol");
var SmartNameResolver = artifacts.require("./services/resolver/SmartNameResolver.sol");

module.exports = function(deployer) {

  deployer.then(async () => {
    await deployer.deploy(SmartNameLibrary)
    await deployer.link(SmartNameLibrary, SmartNameRegistry);
    let SmartNameRegistryInstance = await deployer.deploy(SmartNameRegistry);
    await deployer.deploy(SmartNameResolver, SmartNameRegistryInstance.address);
  })
};
