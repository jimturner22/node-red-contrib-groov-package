"use strict";
var NodeHandlers = require("./node-handlers");
var ConfigHandler = require("./config-handler");
var semver = require('semver');
var module;
function checkVersion(RED) {
    var minNodeJsRequired = 'v4.4.5';
    if (semver.lt(process.version, minNodeJsRequired)) {
        RED.log.warn('The Opto 22 Groov nodes require Node.js ' + minNodeJsRequired + ' or greater.');
    }
}
module.exports = function (RED) {
    checkVersion(RED);
    NodeHandlers.setRED(RED);
    ConfigHandler.setRED(RED);
    RED.nodes.registerType(NodeHandlers.ReadNodeImpl.getNodeType(), NodeHandlers.ReadNodeImpl.createReadNode);
    RED.nodes.registerType(NodeHandlers.WriteNodeImpl.getNodeType(), NodeHandlers.WriteNodeImpl.createWriteNode);
    RED.nodes.registerType("groov-data-store", ConfigHandler.createDataStoreNode);
    RED.nodes.registerType("groov-project", ConfigHandler.createProjectNode, {
        credentials: {
            key: { type: "text" },
            publicCertPath: { type: "text" },
            caCertPath: { type: "text" }
        }
    });
};
