"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Structures = void 0;
var Structures_1 = require("./Structures");
Object.defineProperty(exports, "Structures", { enumerable: true, get: function () { return Structures_1.Structures; } });
__exportStar(require("./structures/Manager"), exports);
__exportStar(require("./structures/Player"), exports);
__exportStar(require("./structures/Socket"), exports);
__exportStar(require("./structures/Plugin"), exports);