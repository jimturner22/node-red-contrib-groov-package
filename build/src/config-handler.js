"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ApiExLib = require("./api-ex");
var CertificateUtil = require("opto22-node-red-common/lib/CertificateUtil");
var MessageQueue_1 = require("opto22-node-red-common/lib/MessageQueue");
var RED;
function setRED(globalRED) {
    RED = globalRED;
    exports.globalConnections.addWatchEvent();
}
exports.setRED = setRED;
exports.GroovDataStoreNodeType = 'groov-data-store';
exports.GroovProjectNodeType = 'groov-project';
function createDataStoreNode(config) {
    var dataStoreNode = this;
    RED.nodes.createNode(dataStoreNode, config);
    var projectNode = RED.nodes.getNode(config.project);
    dataStoreNode.project = projectNode;
    dataStoreNode.dsName = config.dsName;
}
exports.createDataStoreNode = createDataStoreNode;
function createProjectNode(config) {
    var projectNode = this;
    RED.nodes.createNode(projectNode, config);
    var address = config.address;
    var isLocalhost = address === 'localhost';
    var key = projectNode.credentials.key;
    var publicCertPath = projectNode.credentials.publicCertPath;
    var caCertPath = projectNode.credentials.caCertPath;
    key = key ? key : '';
    publicCertPath = publicCertPath ? publicCertPath.trim() : '';
    caCertPath = caCertPath ? caCertPath.trim() : '';
    var publicCertFile;
    var caCertFile;
    if (key === '') {
        RED.log.error('Missing API key for ' + address);
    }
    if (!isLocalhost) {
        if (caCertPath.length === 0) {
            RED.log.error('Missing SSL CA certificate for ' + address);
        }
        try {
            publicCertFile = CertificateUtil.getCertFile(RED, publicCertPath);
            caCertFile = CertificateUtil.getCertFile(RED, caCertPath);
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                RED.log.error('Cannot open certificate file at \'' + err.path + '\'.');
            }
            else if (err.code === 'EACCES') {
                RED.log.error('Cannot open certificate file at \'' + err.path + '\' due to file permissions.');
            }
            else {
                RED.log.error(err);
            }
        }
    }
    var apiClient = exports.globalConnections.createConnection(address, key, publicCertFile, caCertFile, config.id);
    projectNode.on('close', function () {
        apiClient.queue.dump();
    });
}
exports.createProjectNode = createProjectNode;
var DataStoreConnection = (function () {
    function DataStoreConnection(apiClient, queue) {
        this.apiClient = apiClient;
        this.queue = queue;
    }
    return DataStoreConnection;
}());
var DataStoreConnections = (function () {
    function DataStoreConnections() {
        this.connectionCache = [];
    }
    DataStoreConnections.prototype.createConnection = function (address, key, publicCertFile, caCertFile, id) {
        var apiClient = new ApiExLib.DatastoreApiEx(key, 'https://' + address, publicCertFile, caCertFile);
        this.connectionCache[id] = new DataStoreConnection(apiClient, new MessageQueue_1.default(500));
        return this.connectionCache[id];
    };
    DataStoreConnections.prototype.getConnection = function (id) {
        return this.connectionCache[id];
    };
    DataStoreConnections.prototype.addWatchEvent = function () {
        var _this = this;
        RED.events.on('nodes-started', function () {
            for (var client in _this.connectionCache) {
                _this.connectionCache[client].apiClient.clearTagMap();
            }
        });
    };
    return DataStoreConnections;
}());
exports.DataStoreConnections = DataStoreConnections;
exports.globalConnections = new DataStoreConnections();
