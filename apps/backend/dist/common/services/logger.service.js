"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = void 0;
const common_1 = require("@nestjs/common");
const winston = __importStar(require("winston"));
let LoggerService = class LoggerService {
    logger;
    constructor() {
        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
                }),
            ],
        });
    }
    log(message, ...optionalParams) {
        const { context, meta } = this.extractMeta(optionalParams);
        this.logger.info(message, { context, meta });
    }
    error(message, ...optionalParams) {
        const { context, meta } = this.extractMeta(optionalParams);
        this.logger.error(message, { context, meta });
    }
    warn(message, ...optionalParams) {
        const { context, meta } = this.extractMeta(optionalParams);
        this.logger.warn(message, { context, meta });
    }
    debug(message, ...optionalParams) {
        const { context, meta } = this.extractMeta(optionalParams);
        this.logger.debug(message, { context, meta });
    }
    verbose(message, ...optionalParams) {
        const { context, meta } = this.extractMeta(optionalParams);
        this.logger.verbose(message, { context, meta });
    }
    fatal(message, ...optionalParams) {
        const { context, meta } = this.extractMeta(optionalParams);
        this.logger.error(message, { context, meta, fatal: true });
    }
    extractMeta(params) {
        if (params.length === 0) {
            return { meta: [] };
        }
        const last = params[params.length - 1];
        if (typeof last === 'string') {
            return {
                context: last,
                meta: params.slice(0, -1),
            };
        }
        return { meta: params };
    }
};
exports.LoggerService = LoggerService;
exports.LoggerService = LoggerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], LoggerService);
//# sourceMappingURL=logger.service.js.map