"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var request = require('request');
var Promise = require('bluebird');
var defaultBasePath = 'https://localhost/api';
var TagValue = (function () {
    function TagValue() {
    }
    return TagValue;
}());
exports.TagValue = TagValue;
var TagValue;
(function (TagValue) {
    (function (ValueTypeEnum) {
        ValueTypeEnum[ValueTypeEnum["TagValueBoolean"] = 'tagValueBoolean'] = "TagValueBoolean";
        ValueTypeEnum[ValueTypeEnum["IntegerValue"] = 'integerValue'] = "IntegerValue";
        ValueTypeEnum[ValueTypeEnum["FloatValue"] = 'floatValue'] = "FloatValue";
        ValueTypeEnum[ValueTypeEnum["StringValue"] = 'stringValue'] = "StringValue";
        ValueTypeEnum[ValueTypeEnum["BooleanArrayValue"] = 'booleanArrayValue'] = "BooleanArrayValue";
        ValueTypeEnum[ValueTypeEnum["IntegerArrayValue"] = 'integerArrayValue'] = "IntegerArrayValue";
        ValueTypeEnum[ValueTypeEnum["FloatArrayValue"] = 'floatArrayValue'] = "FloatArrayValue";
        ValueTypeEnum[ValueTypeEnum["StringArrayValue"] = 'stringArrayValue'] = "StringArrayValue";
        ValueTypeEnum[ValueTypeEnum["ErrorValue"] = 'errorValue'] = "ErrorValue";
    })(TagValue.ValueTypeEnum || (TagValue.ValueTypeEnum = {}));
    var ValueTypeEnum = TagValue.ValueTypeEnum;
})(TagValue = exports.TagValue || (exports.TagValue = {}));
var BooleanValue = (function (_super) {
    __extends(BooleanValue, _super);
    function BooleanValue() {
        _super.apply(this, arguments);
    }
    return BooleanValue;
}(TagValue));
exports.BooleanValue = BooleanValue;
var BooleanValueArray = (function (_super) {
    __extends(BooleanValueArray, _super);
    function BooleanValueArray() {
        _super.apply(this, arguments);
    }
    return BooleanValueArray;
}(TagValue));
exports.BooleanValueArray = BooleanValueArray;
var Device = (function () {
    function Device() {
    }
    return Device;
}());
exports.Device = Device;
var DataStoreDevice = (function (_super) {
    __extends(DataStoreDevice, _super);
    function DataStoreDevice() {
        _super.apply(this, arguments);
    }
    return DataStoreDevice;
}(Device));
exports.DataStoreDevice = DataStoreDevice;
var ErrorValue = (function (_super) {
    __extends(ErrorValue, _super);
    function ErrorValue() {
        _super.apply(this, arguments);
    }
    return ErrorValue;
}(TagValue));
exports.ErrorValue = ErrorValue;
var FloatArrayValue = (function (_super) {
    __extends(FloatArrayValue, _super);
    function FloatArrayValue() {
        _super.apply(this, arguments);
    }
    return FloatArrayValue;
}(TagValue));
exports.FloatArrayValue = FloatArrayValue;
var FloatValue = (function (_super) {
    __extends(FloatValue, _super);
    function FloatValue() {
        _super.apply(this, arguments);
    }
    return FloatValue;
}(TagValue));
exports.FloatValue = FloatValue;
var IntegerArrayValue = (function (_super) {
    __extends(IntegerArrayValue, _super);
    function IntegerArrayValue() {
        _super.apply(this, arguments);
    }
    return IntegerArrayValue;
}(TagValue));
exports.IntegerArrayValue = IntegerArrayValue;
var IntegerValue = (function (_super) {
    __extends(IntegerValue, _super);
    function IntegerValue() {
        _super.apply(this, arguments);
    }
    return IntegerValue;
}(TagValue));
exports.IntegerValue = IntegerValue;
var StringArrayValue = (function (_super) {
    __extends(StringArrayValue, _super);
    function StringArrayValue() {
        _super.apply(this, arguments);
    }
    return StringArrayValue;
}(TagValue));
exports.StringArrayValue = StringArrayValue;
var StringValue = (function (_super) {
    __extends(StringValue, _super);
    function StringValue() {
        _super.apply(this, arguments);
    }
    return StringValue;
}(TagValue));
exports.StringValue = StringValue;
var TagDefinition = (function () {
    function TagDefinition() {
    }
    return TagDefinition;
}());
exports.TagDefinition = TagDefinition;
var TagDefinition;
(function (TagDefinition) {
    (function (DataTypeEnum) {
        DataTypeEnum[DataTypeEnum["Boolean"] = 'boolean'] = "Boolean";
        DataTypeEnum[DataTypeEnum["Integer"] = 'integer'] = "Integer";
        DataTypeEnum[DataTypeEnum["Float"] = 'float'] = "Float";
        DataTypeEnum[DataTypeEnum["String"] = 'string'] = "String";
        DataTypeEnum[DataTypeEnum["BooleanArray"] = 'booleanArray'] = "BooleanArray";
        DataTypeEnum[DataTypeEnum["IntegerArray"] = 'integerArray'] = "IntegerArray";
        DataTypeEnum[DataTypeEnum["FloatArray"] = 'floatArray'] = "FloatArray";
        DataTypeEnum[DataTypeEnum["StringArray"] = 'stringArray'] = "StringArray";
    })(TagDefinition.DataTypeEnum || (TagDefinition.DataTypeEnum = {}));
    var DataTypeEnum = TagDefinition.DataTypeEnum;
})(TagDefinition = exports.TagDefinition || (exports.TagDefinition = {}));
var TagReference = (function () {
    function TagReference() {
    }
    return TagReference;
}());
exports.TagReference = TagReference;
var HttpBasicAuth = (function () {
    function HttpBasicAuth() {
    }
    HttpBasicAuth.prototype.applyToRequest = function (requestOptions) {
        requestOptions.auth = {
            username: this.username, password: this.password
        };
    };
    return HttpBasicAuth;
}());
exports.HttpBasicAuth = HttpBasicAuth;
var ApiKeyAuth = (function () {
    function ApiKeyAuth(location, paramName) {
        this.location = location;
        this.paramName = paramName;
    }
    ApiKeyAuth.prototype.applyToRequest = function (requestOptions) {
        if (this.location == "query") {
            requestOptions.qs[this.paramName] = this.apiKey;
        }
        else if (this.location == "header") {
            requestOptions.headers[this.paramName] = this.apiKey;
        }
    };
    return ApiKeyAuth;
}());
exports.ApiKeyAuth = ApiKeyAuth;
var OAuth = (function () {
    function OAuth() {
    }
    OAuth.prototype.applyToRequest = function (requestOptions) {
        requestOptions.headers["Authorization"] = "Bearer " + this.accessToken;
    };
    return OAuth;
}());
exports.OAuth = OAuth;
var VoidAuth = (function () {
    function VoidAuth() {
    }
    VoidAuth.prototype.applyToRequest = function (requestOptions) {
    };
    return VoidAuth;
}());
exports.VoidAuth = VoidAuth;
(function (DatastoreApiApiKeys) {
    DatastoreApiApiKeys[DatastoreApiApiKeys["api_key"] = 0] = "api_key";
})(exports.DatastoreApiApiKeys || (exports.DatastoreApiApiKeys = {}));
var DatastoreApiApiKeys = exports.DatastoreApiApiKeys;
var DatastoreApi = (function () {
    function DatastoreApi(basePathOrUsername, password, basePath) {
        this.basePath = defaultBasePath;
        this.defaultHeaders = {};
        this._useQuerystring = false;
        this.authentications = {
            'default': new VoidAuth(),
            'api_key': new ApiKeyAuth('query', 'api_key'),
        };
        if (password) {
            if (basePath) {
                this.basePath = basePath;
            }
        }
        else {
            if (basePathOrUsername) {
                this.basePath = basePathOrUsername;
            }
        }
    }
    Object.defineProperty(DatastoreApi.prototype, "useQuerystring", {
        set: function (value) {
            this._useQuerystring = value;
        },
        enumerable: true,
        configurable: true
    });
    DatastoreApi.prototype.setApiKey = function (key, value) {
        this.authentications[DatastoreApiApiKeys[key]].apiKey = value;
    };
    DatastoreApi.prototype.extendObj = function (objA, objB) {
        for (var key in objB) {
            if (objB.hasOwnProperty(key)) {
                objA[key] = objB[key];
            }
        }
        return objA;
    };
    DatastoreApi.prototype.dataStoreListDeviceTags = function (id) {
        var localVarPath = this.basePath + '/v1/data-store/devices/{id}/tags'
            .replace('{' + 'id' + '}', String(id));
        var queryParameters = {};
        var headerParams = this.extendObj({}, this.defaultHeaders);
        var formParams = {};
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling dataStoreListDeviceTags.');
        }
        var useFormData = false;
        var requestOptions = {
            method: 'GET',
            qs: queryParameters,
            headers: headerParams,
            uri: localVarPath,
            useQuerystring: this._useQuerystring,
            json: true,
        };
        this.authentications.api_key.applyToRequest(requestOptions);
        this.authentications.default.applyToRequest(requestOptions);
        if (Object.keys(formParams).length) {
            if (useFormData) {
                requestOptions.formData = formParams;
            }
            else {
                requestOptions.form = formParams;
            }
        }
        return new Promise(function (resolve, reject) {
            request(requestOptions, function (error, response, body) {
                if (error) {
                    reject(error);
                }
                else {
                    if (response.statusCode >= 200 && response.statusCode <= 299) {
                        resolve({ response: response, body: body });
                    }
                    else {
                        reject({ response: response, body: body });
                    }
                }
            });
        });
    };
    DatastoreApi.prototype.dataStoreListDevices = function () {
        var localVarPath = this.basePath + '/v1/data-store/devices';
        var queryParameters = {};
        var headerParams = this.extendObj({}, this.defaultHeaders);
        var formParams = {};
        var useFormData = false;
        var requestOptions = {
            method: 'GET',
            qs: queryParameters,
            headers: headerParams,
            uri: localVarPath,
            useQuerystring: this._useQuerystring,
            json: true,
        };
        this.authentications.api_key.applyToRequest(requestOptions);
        this.authentications.default.applyToRequest(requestOptions);
        if (Object.keys(formParams).length) {
            if (useFormData) {
                requestOptions.formData = formParams;
            }
            else {
                requestOptions.form = formParams;
            }
        }
        return new Promise(function (resolve, reject) {
            request(requestOptions, function (error, response, body) {
                if (error) {
                    reject(error);
                }
                else {
                    if (response.statusCode >= 200 && response.statusCode <= 299) {
                        resolve({ response: response, body: body });
                    }
                    else {
                        reject({ response: response, body: body });
                    }
                }
            });
        });
    };
    DatastoreApi.prototype.dataStoreListTags = function () {
        var localVarPath = this.basePath + '/v1/data-store/tags';
        var queryParameters = {};
        var headerParams = this.extendObj({}, this.defaultHeaders);
        var formParams = {};
        var useFormData = false;
        var requestOptions = {
            method: 'GET',
            qs: queryParameters,
            headers: headerParams,
            uri: localVarPath,
            useQuerystring: this._useQuerystring,
            json: true,
        };
        this.authentications.api_key.applyToRequest(requestOptions);
        this.authentications.default.applyToRequest(requestOptions);
        if (Object.keys(formParams).length) {
            if (useFormData) {
                requestOptions.formData = formParams;
            }
            else {
                requestOptions.form = formParams;
            }
        }
        return new Promise(function (resolve, reject) {
            request(requestOptions, function (error, response, body) {
                if (error) {
                    reject(error);
                }
                else {
                    if (response.statusCode >= 200 && response.statusCode <= 299) {
                        resolve({ response: response, body: body });
                    }
                    else {
                        reject({ response: response, body: body });
                    }
                }
            });
        });
    };
    DatastoreApi.prototype.dataStoreReadSingleTag = function (id, index, count) {
        var localVarPath = this.basePath + '/v1/data-store/read/{id}'
            .replace('{' + 'id' + '}', String(id));
        var queryParameters = {};
        var headerParams = this.extendObj({}, this.defaultHeaders);
        var formParams = {};
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling dataStoreReadSingleTag.');
        }
        if (index !== undefined) {
            queryParameters['index'] = index;
        }
        if (count !== undefined) {
            queryParameters['count'] = count;
        }
        var useFormData = false;
        var requestOptions = {
            method: 'GET',
            qs: queryParameters,
            headers: headerParams,
            uri: localVarPath,
            useQuerystring: this._useQuerystring,
            json: true,
        };
        this.authentications.api_key.applyToRequest(requestOptions);
        this.authentications.default.applyToRequest(requestOptions);
        if (Object.keys(formParams).length) {
            if (useFormData) {
                requestOptions.formData = formParams;
            }
            else {
                requestOptions.form = formParams;
            }
        }
        return new Promise(function (resolve, reject) {
            request(requestOptions, function (error, response, body) {
                if (error) {
                    reject(error);
                }
                else {
                    if (response.statusCode >= 200 && response.statusCode <= 299) {
                        resolve({ response: response, body: body });
                    }
                    else {
                        reject({ response: response, body: body });
                    }
                }
            });
        });
    };
    DatastoreApi.prototype.dataStoreReadTags = function (tags) {
        var localVarPath = this.basePath + '/v1/data-store/read';
        var queryParameters = {};
        var headerParams = this.extendObj({}, this.defaultHeaders);
        var formParams = {};
        if (tags === null || tags === undefined) {
            throw new Error('Required parameter tags was null or undefined when calling dataStoreReadTags.');
        }
        var useFormData = false;
        var requestOptions = {
            method: 'POST',
            qs: queryParameters,
            headers: headerParams,
            uri: localVarPath,
            useQuerystring: this._useQuerystring,
            json: true,
            body: tags,
        };
        this.authentications.api_key.applyToRequest(requestOptions);
        this.authentications.default.applyToRequest(requestOptions);
        if (Object.keys(formParams).length) {
            if (useFormData) {
                requestOptions.formData = formParams;
            }
            else {
                requestOptions.form = formParams;
            }
        }
        return new Promise(function (resolve, reject) {
            request(requestOptions, function (error, response, body) {
                if (error) {
                    reject(error);
                }
                else {
                    if (response.statusCode >= 200 && response.statusCode <= 299) {
                        resolve({ response: response, body: body });
                    }
                    else {
                        reject({ response: response, body: body });
                    }
                }
            });
        });
    };
    DatastoreApi.prototype.dataStoreWriteSingleTag = function (id, value, index) {
        var localVarPath = this.basePath + '/v1/data-store/write/{id}'
            .replace('{' + 'id' + '}', String(id));
        var queryParameters = {};
        var headerParams = this.extendObj({}, this.defaultHeaders);
        var formParams = {};
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling dataStoreWriteSingleTag.');
        }
        if (value === null || value === undefined) {
            throw new Error('Required parameter value was null or undefined when calling dataStoreWriteSingleTag.');
        }
        if (value !== undefined) {
            queryParameters['value'] = value;
        }
        if (index !== undefined) {
            queryParameters['index'] = index;
        }
        var useFormData = false;
        var requestOptions = {
            method: 'POST',
            qs: queryParameters,
            headers: headerParams,
            uri: localVarPath,
            useQuerystring: this._useQuerystring,
            json: true,
        };
        this.authentications.api_key.applyToRequest(requestOptions);
        this.authentications.default.applyToRequest(requestOptions);
        if (Object.keys(formParams).length) {
            if (useFormData) {
                requestOptions.formData = formParams;
            }
            else {
                requestOptions.form = formParams;
            }
        }
        return new Promise(function (resolve, reject) {
            request(requestOptions, function (error, response, body) {
                if (error) {
                    reject(error);
                }
                else {
                    if (response.statusCode >= 200 && response.statusCode <= 299) {
                        resolve({ response: response, body: body });
                    }
                    else {
                        reject({ response: response, body: body });
                    }
                }
            });
        });
    };
    return DatastoreApi;
}());
exports.DatastoreApi = DatastoreApi;
