"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var net_1 = require("net");
var AdminRPC = /** @class */ (function () {
    function AdminRPC(_a) {
        var onData = _a.onData;
        var _this = this;
        this.nonce = 0;
        this.interval = null;
        this.client = net_1.default.createConnection("/mnt/solana-ledger/admin.rpc", function () {
            console.log('[AdminRPC] connected to socket');
            _this.requestContactInfo();
        });
        this.client.on('end', function () {
            console.log('[AdminRPC] disconnected from server');
        });
        this.client.on('data', function (data) {
            console.log(data.toString());
            onData(data.toString());
        });
    }
    AdminRPC.prototype.start = function (refreshSeconds) {
        var _this = this;
        if (refreshSeconds === void 0) { refreshSeconds = 10; }
        if (this.interval) {
            console.error('[AdminRPC] already started');
            return;
        }
        this.interval = setInterval(function () {
            _this.requestStartStatus();
            _this.requestStartTime();
        }, refreshSeconds * 1000);
    };
    AdminRPC.prototype.stop = function () {
        if (!this.interval) {
            console.error('[AdminRPC] already stopped');
            return;
        }
        clearInterval(this.interval);
        this.interval = null;
    };
    AdminRPC.prototype.requestStartStatus = function () {
        this.request('startStatus');
    };
    AdminRPC.prototype.requestStartTime = function () {
        this.request('startTime');
    };
    AdminRPC.prototype.requestContactInfo = function () {
        this.request('contactInfo');
    };
    AdminRPC.prototype.requestSecondaryIndexKeySize = function (pubKey) {
        this.request('secondaryIndexKeySize', [pubKey]);
    };
    AdminRPC.prototype.request = function (method, params) {
        if (params === void 0) { params = []; }
        var request = {
            jsonrpc: "2.0",
            method: method,
            params: params,
            id: this.nonce++,
        };
        this.client.write("".concat(JSON.stringify(request), "\r\n"));
    };
    return AdminRPC;
}());
exports.default = AdminRPC;
