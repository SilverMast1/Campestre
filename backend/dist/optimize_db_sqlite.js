"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./db"));
async function optimize() {
    console.log('Enabling WAL (Write-Ahead Logging) mode on SQLite...');
    await db_1.default.$queryRawUnsafe('PRAGMA journal_mode=WAL;');
    console.log('Setting synchronous mode to NORMAL...');
    await db_1.default.$queryRawUnsafe('PRAGMA synchronous=NORMAL;');
    console.log('Executing VACUUM to defragment database file...');
    await db_1.default.$executeRawUnsafe('VACUUM;');
    console.log('Database optimization completed successfully!');
}
optimize().catch(console.error);
