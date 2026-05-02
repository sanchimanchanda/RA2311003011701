"use strict";
/**
 * Logging Middleware - Public API
 *
 * Re-exports all types and the Logger class for external consumption.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOG_LEVEL_SEVERITY = exports.createLogFunction = exports.createLogger = exports.Logger = void 0;
var logger_1 = require("./logger");
Object.defineProperty(exports, "Logger", { enumerable: true, get: function () { return logger_1.Logger; } });
Object.defineProperty(exports, "createLogger", { enumerable: true, get: function () { return logger_1.createLogger; } });
Object.defineProperty(exports, "createLogFunction", { enumerable: true, get: function () { return logger_1.createLogFunction; } });
var types_1 = require("./types");
Object.defineProperty(exports, "LOG_LEVEL_SEVERITY", { enumerable: true, get: function () { return types_1.LOG_LEVEL_SEVERITY; } });
//# sourceMappingURL=index.js.map