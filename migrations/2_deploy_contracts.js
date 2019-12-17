var SmartNameLibrary = artifacts.require("./SmartNameLibrary.sol");
var SmartNameRegistry = artifacts.require("./SmartNameRegistry.sol");
var SmartNameResolver = artifacts.require("./SmartNameResolver.sol");

module.exports = function(deployer) {

  deployer.then(async () => {
    await deployer.deploy(SmartNameLibrary)
    await deployer.link(SmartNameLibrary, SmartNameRegistry);
    await deployer.deploy(SmartNameRegistry);
    await deployer.deploy(SmartNameRegistry, SmartNameRegistry);
    
  })
};
