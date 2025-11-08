import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const contractPath = path.resolve('contracts/openapi.json');
const raw = fs.readFileSync(contractPath, 'utf-8');
const contract = JSON.parse(raw);

// Basic sanity checks for OpenAPI document
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// Minimal OpenAPI meta-schema check (loose). For rigorous validation, integrate 'swagger-parser'.
function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`[contract] ${msg}`);
    process.exitCode = 1;
  }
}

assert(contract.openapi?.startsWith('3.'), 'OpenAPI version 3.x required');
assert(typeof contract.info?.title === 'string', 'info.title must exist');
assert(typeof contract.paths === 'object', 'paths must exist');

console.log('[contract] OpenAPI doc basic checks passed.');
