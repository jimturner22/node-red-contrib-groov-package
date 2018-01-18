"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ApiLib = require("./api");
var https = require('https');
var fs = require('fs');
var DatastoreApi = ApiLib.DatastoreApi;
var RequestOptionsModifier = (function () {
    function RequestOptionsModifier(originalAddress, port, isLocalhost, publicCertFile, caCertFile, agent) {
        this.publicCertFile = publicCertFile;
        this.caCertFile = caCertFile;
        this.agent = agent;
        this.isLocalhost = isLocalhost;
        this.port = port;
    }
    RequestOptionsModifier.prototype.applyToRequest = function (requestOptions) {
        if (this.publicCertFile) {
            requestOptions.cert = this.publicCertFile;
        }
        if (this.caCertFile) {
            requestOptions.ca = this.caCertFile;
        }
        if (!this.publicCertFile && !this.caCertFile && this.isLocalhost) {
            requestOptions.rejectUnauthorized = false;
        }
        requestOptions.port = this.port;
        requestOptions.forever = true;
        requestOptions.agent = this.agent;
    };
    return RequestOptionsModifier;
}());
var DatastoreApiEx = (function (_super) {
    __extends(DatastoreApiEx, _super);
    function DatastoreApiEx(apiKey, address, publicCertFile, caCertFile) {
        var path = DatastoreApiEx.isEpicBox() ? '/view/api/' : '/api';
        _super.call(this, address + path);
        this.tagMap = null;
        this.originalAddress = address;
        this.port = 443;
        this.apiKey = apiKey;
        this.publicCertFile = publicCertFile;
        this.caCertFile = caCertFile;
        if (this.originalAddress.trim().toLowerCase() === 'https://localhost') {
            this.isLocalHost = true;
            if (this.isGroovBox()) {
                this.port = 8443;
            }
        }
        this.replaceDefaultAuthWithCustomRequestOptions();
        this.setApiKey(ApiLib.DatastoreApiApiKeys.api_key, apiKey);
    }
    DatastoreApiEx.prototype.isGroovBox = function () {
        var hasMmpServer = fs.existsSync("/etc/init.d/mmpserver");
        var hasSupervisor = fs.existsSync("/usr/sbin/supervisor-get-serial-number");
        var hasOptoapps = fs.existsSync("/var/lib/jetty/optoapps");
        return hasMmpServer && hasSupervisor && hasOptoapps;
    };
    DatastoreApiEx.isEpicBox = function () {
        var hasOptoApps = fs.existsSync("/usr/share/nxtio/");
        return hasOptoApps;
    };
    DatastoreApiEx.prototype.replaceDefaultAuthWithCustomRequestOptions = function () {
        var httpsAgent = new https.Agent({
            keepAlive: true,
            maxSockets: 1,
            port: this.port
        });
        this.httpAgent = httpsAgent;
        this.authentications.default = new RequestOptionsModifier(this.originalAddress, this.port, this.isLocalHost, this.publicCertFile, this.caCertFile, httpsAgent);
    };
    DatastoreApiEx.prototype.hasConfigError = function () {
        if (this.configError === undefined) {
            if (!this.apiKey) {
                this.configError = true;
            }
            else {
                this.configError = false;
            }
        }
        return this.configError;
    };
    DatastoreApiEx.prototype.hasTagMap = function () {
        return this.tagMap ? true : false;
    };
    DatastoreApiEx.prototype.clearTagMap = function () {
        this.tagMap = null;
    };
    DatastoreApiEx.prototype.populateTagMap = function (callback) {
        var _this = this;
        this.tagMap = {};
        _super.prototype.dataStoreListDevices.call(this).then(function (fullfilledResponse) {
            _this.tagMap = {};
            var devices = fullfilledResponse.body;
            var deviceCallbackCount = 0;
            devices.forEach(function (device) {
                if (device.deviceType === 'dataStoreDevice') {
                    _this.tagMap[device.name] = [];
                    _super.prototype.dataStoreListDeviceTags.call(_this, device.id).then(function (fullfilledResponse) {
                        deviceCallbackCount++;
                        var tags = fullfilledResponse.body;
                        var tagNameToIdMap = {};
                        for (var j = 0; j < tags.length; j++) {
                            tagNameToIdMap[tags[j].name] = tags[j].id;
                        }
                        _this.tagMap[device.name] = tagNameToIdMap;
                        if (deviceCallbackCount === devices.length) {
                            callback(null);
                        }
                    }, function (error) {
                        callback(error);
                    });
                }
            });
        }, function (error) {
            callback(error);
        });
    };
    DatastoreApiEx.prototype.getReadSingleTagByNamePromise = function (deviceName, tagName, index, count, callback) {
        var _this = this;
        if (this.tagMap) {
            this.getReadSingleTagByNamePromiseImpl(deviceName, tagName, index, count, callback);
        }
        else {
            this.populateTagMap(function (error) {
                if (error) {
                    callback(null, error);
                }
                else {
                    _this.getReadSingleTagByNamePromiseImpl(deviceName, tagName, index, count, callback);
                }
            });
        }
    };
    DatastoreApiEx.prototype.getReadSingleTagByNamePromiseImpl = function (deviceName, tagName, index, count, callback) {
        if (!this.tagMap[deviceName]) {
            callback(null, 'unknown device name');
        }
        else if (!this.tagMap[deviceName][tagName]) {
            callback(null, 'unknown tag name');
        }
        else {
            var tagID = this.tagMap[deviceName][tagName];
            if (callback) {
                callback(_super.prototype.dataStoreReadSingleTag.call(this, tagID, index, count), null);
            }
        }
    };
    DatastoreApiEx.prototype.getWriteSingleTagByNamePromise = function (value, deviceName, tagName, index, callback) {
        var _this = this;
        if (this.tagMap) {
            this.getWriteSingleTagByNamePromiseImpl(value, deviceName, tagName, index, callback);
        }
        else {
            this.populateTagMap(function (error) {
                if (error) {
                    callback(null, error);
                }
                else {
                    _this.getWriteSingleTagByNamePromiseImpl(value, deviceName, tagName, index, callback);
                }
            });
        }
    };
    DatastoreApiEx.prototype.getWriteSingleTagByNamePromiseImpl = function (value, deviceName, tagName, index, callback) {
        if (!this.tagMap[deviceName]) {
            callback(null, 'unknown device name');
        }
        else if (!this.tagMap[deviceName][tagName]) {
            callback(null, 'unknown tag name');
        }
        else if (value === null) {
            callback(null, 'value is null');
        }
        else {
            var tagID = this.tagMap[deviceName][tagName];
            callback(_super.prototype.dataStoreWriteSingleTag.call(this, tagID, value, index), null);
        }
    };
    DatastoreApiEx.prototype.dataStoreWriteTags = function (tags, callback) {
        var _this = this;
        if (tags.length == 0) {
            callback(null);
            return;
        }
        var tag = tags.shift();
        this.dataStoreWriteSingleTag(tag.id, tag.value, tag.index)
            .then(function (fullfilledResponse) {
            _this.dataStoreWriteTags(tags, callback);
        }, function (error) {
            callback(error);
        });
    };
    return DatastoreApiEx;
}(DatastoreApi));
exports.DatastoreApiEx = DatastoreApiEx;
