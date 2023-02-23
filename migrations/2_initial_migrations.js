const Auction = artifacts.require("Auction");
const Todo = artifacts.require("Todo");

module.exports = function (deployer) {
 deployer.deploy(Auction);
 deployer.deploy(Todo);
};