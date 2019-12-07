var SmartNameRegistry = artifacts.require("./SmartNameRegistry.sol");

module.exports = function(deployer) {
  deployer.deploy(SmartNameRegistry);
};
