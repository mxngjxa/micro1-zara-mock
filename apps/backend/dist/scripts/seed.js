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
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const dotenv = __importStar(require("dotenv"));
const user_entity_1 = require("../database/entities/user.entity");
const interview_entity_1 = require("../database/entities/interview.entity");
const question_entity_1 = require("../database/entities/question.entity");
const answer_entity_1 = require("../database/entities/answer.entity");
dotenv.config();
const dataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'interview_db',
    entities: [user_entity_1.User, interview_entity_1.Interview, question_entity_1.Question, answer_entity_1.Answer],
    migrations: ['src/database/migrations/*.ts'],
    synchronize: false,
});
async function seed() {
    try {
        console.log('Connecting to database...');
        await dataSource.initialize();
        console.log('Connected.');
        console.log('Running migrations...');
        await dataSource.runMigrations();
        console.log('Migrations executed.');
        const userRepository = dataSource.getRepository(user_entity_1.User);
        const email = 'test@example.com';
        const existingUser = await userRepository.findOneBy({ email });
        if (existingUser) {
            console.log('Test user already exists.');
        }
        else {
            console.log('Creating test user...');
            const user = new user_entity_1.User();
            user.email = email;
            user.password_hash =
                '$2b$10$EpOssIKKr.q3z0jdQqxOT.y5/d.5c6.5.6.5.6.5.6.5.6.5.6';
            user.email_verified = true;
            user.created_at = new Date();
            user.updated_at = new Date();
            await userRepository.save(user);
            console.log('Test user created successfully.');
        }
        await dataSource.destroy();
        console.log('Seeding complete.');
    }
    catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}
seed();
//# sourceMappingURL=seed.js.map