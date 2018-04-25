"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ErrorHanding = require("./error-handling");
var ConfigHandler = require("./config-handler");
var RED;
function setRED(globalRED) {
    RED = globalRED;
}
exports.setRED = setRED;
var NodeBaseImpl = (function () {
    function NodeBaseImpl(nodeConfig, node) {
        this.nodeConfig = nodeConfig;
        this.dataStoreNode = RED.nodes.getNode(nodeConfig.dataStore);
        this.node = node;
        if (this.dataStoreNode) {
            if (this.dataStoreNode.project) {
                this.groovNode = RED.nodes.getNode(this.dataStoreNode.project.id);
                if (this.groovNode) {
                    var connection = ConfigHandler.globalConnections.getConnection(this.dataStoreNode.project.id);
                    this.apiLib = connection.apiClient;
                    this.msgQueue = connection.queue;
                }
            }
            if (!this.groovNode) {
                this.node.error('Missing Groov configuration', {});
            }
        }
        else {
            this.node.error('Missing Data Store configuration', {});
        }
    }
    NodeBaseImpl.prototype.addMsg = function (msg) {
        var _this = this;
        if (!this.apiLib || !this.msgQueue) {
            this.node.status({ fill: "red", shape: "dot", text: 'missing Groov configuration' });
            return;
        }
        if (this.apiLib.hasConfigError()) {
            this.node.status({ fill: "red", shape: "dot", text: 'Configuration error' });
            return;
        }
        this.apiLib.getDeviceType(this.node, function (error) {
            if (error) {
                ErrorHanding.handleErrorResponse(error, msg, _this.node);
                return;
            }
            var queueLength = _this.msgQueue.add(msg, _this.node, _this, _this.onInput);
            if (queueLength < 0) {
                _this.node.warn('Message rejected. Queue is full for Groov.');
            }
            var currentMsgBeingProcessed = _this.msgQueue.getCurrentMessage();
            if (currentMsgBeingProcessed.inputEventObject !== _this) {
                if (queueLength !== 0) {
                    _this.updateQueuedStatus(queueLength);
                }
            }
        });
    };
    NodeBaseImpl.prototype.updateQueuedStatus = function (queueLength) {
        if (queueLength >= 1) {
            this.node.status({ fill: "green", shape: "ring", text: queueLength + ' queued' });
        }
        else if (queueLength < 0) {
            this.node.status({ fill: "yellow", shape: "ring", text: "queue full" });
        }
    };
    NodeBaseImpl.prototype.checkMsgOverrides = function (msg, nodeConfig) {
        if (msg.payload) {
            if (typeof msg.payload === 'object') {
                if (msg.payload.tagName !== undefined) {
                    nodeConfig.tagName = msg.payload.tagName;
                }
                if (msg.payload.tableStartIndex !== undefined) {
                    nodeConfig.tableStartIndex = msg.payload.tableStartIndex;
                }
                if (msg.payload.tableLength !== undefined) {
                    nodeConfig.tableLength = msg.payload.tableLength;
                }
            }
        }
    };
    return NodeBaseImpl;
}());
exports.NodeBaseImpl = NodeBaseImpl;
var ReadNodeImpl = (function (_super) {
    __extends(ReadNodeImpl, _super);
    function ReadNodeImpl(node, nodeConfig) {
        var _this = _super.call(this, nodeConfig, node) || this;
        _this.nodeReadConfig = nodeConfig;
        _this.node.on('close', function () {
            _this.onClose();
        });
        _this.node.on('input', function (msg) {
            _this.addMsg(msg);
        });
        return _this;
    }
    ReadNodeImpl.getNodeType = function () {
        return 'groov-read-ds';
    };
    ReadNodeImpl.createReadNode = function (nodeConfig) {
        var node = this;
        RED.nodes.createNode(node, nodeConfig);
        var impl = new ReadNodeImpl(node, nodeConfig);
    };
    ReadNodeImpl.prototype.onClose = function () {
        this.node.status({});
    };
    ReadNodeImpl.prototype.onInput = function (msg) {
        var _this = this;
        if (!this.apiLib.hasTagMap()) {
            this.node.status({ fill: "green", shape: "dot", text: "downloading tag info" });
        }
        this.checkMsgOverrides(msg, this.nodeConfig);
        var tableStartIndex = parseInt(this.nodeConfig.tableStartIndex);
        var tableLength = parseInt(this.nodeConfig.tableLength);
        if (isNaN(tableStartIndex))
            tableStartIndex = undefined;
        if (isNaN(tableLength))
            tableLength = undefined;
        this.apiLib.getReadSingleTagByNamePromise(this.dataStoreNode.dsName, this.nodeConfig.tagName, tableStartIndex, tableLength, function (promise, error) {
            if (error) {
                ErrorHanding.handleErrorResponse(error, msg, _this.node);
                _this.msgQueue.done(50);
            }
            else {
                _this.node.status({ fill: "green", shape: "dot", text: "reading" });
                promise.then(function (fullfilledResponse) {
                    _this.node.status({});
                    msg.body = fullfilledResponse.body;
                    _this.setValue(msg, fullfilledResponse);
                    _this.setTopic(msg);
                    _this.node.send(msg);
                    var queueLength = _this.msgQueue.done(0);
                    _this.updateQueuedStatus(queueLength);
                }, function (error) {
                    ErrorHanding.handleErrorResponse(error, msg, _this.node);
                    _this.msgQueue.done(50);
                });
            }
        });
    };
    ReadNodeImpl.prototype.setValue = function (msg, fullfilledResponse) {
        var newValue;
        if (typeof fullfilledResponse.body === 'object') {
            if (Array.isArray(fullfilledResponse.body)) {
                newValue = fullfilledResponse.body;
            }
            else {
                if (fullfilledResponse.body.value !== undefined) {
                    newValue = fullfilledResponse.body.value;
                }
                else {
                    newValue = fullfilledResponse.body;
                }
            }
        }
        else {
            newValue = fullfilledResponse.body;
        }
        var valueType = this.nodeReadConfig.valueType === undefined ?
            'msg.payload' : this.nodeReadConfig.valueType;
        switch (valueType) {
            case 'msg':
                RED.util.setMessageProperty(msg, this.nodeReadConfig.value, newValue, true);
                ;
                break;
            case 'msg.payload':
                msg.payload = newValue;
                break;
            default:
                throw new Error('Unexpected value type - ' + valueType);
        }
    };
    ReadNodeImpl.prototype.setTopic = function (msg) {
        var topicType = this.nodeReadConfig.topicType;
        switch (topicType) {
            case 'none':
                break;
            case 'user':
                msg.topic = this.nodeReadConfig.topic;
                break;
            default:
                break;
        }
    };
    return ReadNodeImpl;
}(NodeBaseImpl));
exports.ReadNodeImpl = ReadNodeImpl;
var WriteNodeImpl = (function (_super) {
    __extends(WriteNodeImpl, _super);
    function WriteNodeImpl(node, nodeConfig) {
        var _this = _super.call(this, nodeConfig, node) || this;
        _this.nodeWriteConfig = nodeConfig;
        node.on('close', function () {
            _this.onClose();
        });
        node.on('input', function (msg) {
            _this.addMsg(msg);
        });
        return _this;
    }
    WriteNodeImpl.getNodeType = function () {
        return 'groov-write-ds';
    };
    WriteNodeImpl.createWriteNode = function (nodeConfig) {
        var node = this;
        RED.nodes.createNode(node, nodeConfig);
        var impl = new WriteNodeImpl(node, nodeConfig);
    };
    WriteNodeImpl.prototype.onClose = function () {
        this.node.status({});
    };
    WriteNodeImpl.prototype.onInput = function (msg) {
        var _this = this;
        WriteNodeImpl.activeMessageCount++;
        if (!this.apiLib.hasTagMap()) {
            this.node.status({ fill: "green", shape: "dot", text: "downloading tag info" });
        }
        this.checkMsgOverrides(msg, this.nodeConfig);
        try {
            var valueObject = this.getValueObject(msg);
        }
        catch (e) {
            var errorMessage;
            if (e instanceof Error)
                errorMessage = e.message;
            else
                errorMessage = JSON.stringify(e);
            this.node.error(errorMessage, msg);
            this.node.status({ fill: "red", shape: "dot", text: "error" });
            this.msgQueue.done(0);
            return;
        }
        var tableStartIndex = parseInt(this.nodeConfig.tableStartIndex);
        if (isNaN(tableStartIndex))
            tableStartIndex = undefined;
        this.apiLib.getWriteSingleTagByNamePromise(valueObject, this.dataStoreNode.dsName, this.nodeConfig.tagName, tableStartIndex, function (promise, error) {
            if (error) {
                ErrorHanding.handleErrorResponse(error, msg, _this.node);
                WriteNodeImpl.activeMessageCount--;
                _this.msgQueue.done(50);
            }
            else {
                _this.node.status({ fill: "green", shape: "dot", text: "writing" });
                promise.then(function (fullfilledResponse) {
                    WriteNodeImpl.activeMessageCount--;
                    _this.node.status({});
                    msg.body = fullfilledResponse.body;
                    _this.node.send(msg);
                    var queueLength = _this.msgQueue.done(0);
                    _this.updateQueuedStatus(queueLength);
                }, function (error) {
                    WriteNodeImpl.activeMessageCount--;
                    ErrorHanding.handleErrorResponse(error, msg, _this.node);
                    _this.msgQueue.done(50);
                });
            }
        });
    };
    WriteNodeImpl.prototype.getValueObject = function (msg) {
        var valueObject = null;
        var nodeWriteConfig = this.nodeWriteConfig;
        switch (nodeWriteConfig.valueType) {
            case 'msg':
            case 'msg.payload':
                var msgProperty;
                if (nodeWriteConfig.valueType === 'msg.payload') {
                    msgProperty = 'payload';
                }
                else {
                    msgProperty = nodeWriteConfig.value;
                }
                var msgValue = RED.util.getMessageProperty(msg, msgProperty);
                if (msgValue === undefined) {
                    throw new Error('msg.' + msgProperty + ' is undefined.');
                }
                valueObject = msgValue;
                break;
            case 'value':
                valueObject = nodeWriteConfig.value;
                break;
            default:
                throw new Error('Unexpected value type - ' + nodeWriteConfig.valueType);
        }
        return valueObject;
    };
    WriteNodeImpl.activeMessageCount = 0;
    return WriteNodeImpl;
}(NodeBaseImpl));
exports.WriteNodeImpl = WriteNodeImpl;
