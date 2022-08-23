(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.app = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function default_1(Data, Protocol) {
    return {
        async all(stream) {
            const items = await Data.query({ lt: "~" }, stream);
            return items;
        },
        async get(key) {
            const value = await Data.get(key);
            return value || null;
        },
        async del(key) {
            await Protocol({
                type: "del",
                key,
            });
        },
        async set(params) {
            const { key, value } = params;
            await Protocol({
                type: "set",
                key,
                value,
            });
        },
        async helloWorld() {
            const op = {
                type: "helloworld",
            };
            await Protocol(op);
        },
        async sayHello() {
            return Data.get("hello");
        },
    };
}
exports.default = default_1;

},{}],2:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const protocol_1 = __importDefault(require("./protocol"));
const api_1 = __importDefault(require("./api"));
exports.default = { Protocol: protocol_1.default, API: api_1.default };

},{"./api":1,"./protocol":3}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function default_1(op, Data) {
    switch (op.type) {
        case 'set': {
            await Data.put({ key: op.key, value: op.value });
            break;
        }
        case 'del': {
            const p = await Data.get(op.key);
            if (!p)
                break;
            await Data.del(op.key);
            break;
        }
        case "helloworld": {
            await Data.put({ key: "hello", value: "hello world" });
            break;
        }
        default:
            return Data.discard(op, "unknown operation");
    }
}
exports.default = default_1;

},{}]},{},[2])(2)
});
