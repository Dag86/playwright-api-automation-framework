/**
 * @fileoverview Schema validation utilities for API response validation
 * @module utils/schemaValidator
 */

import { Ajv, JSONSchemaType, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

/**
 * Interface representing the result of a schema validation
 * @template T - The expected type of the validated data
 */
export interface ValidationResult<T> {
  /** Whether the validation was successful */
  valid: boolean;
  /** The validated data (only present if validation succeeds) */
  data?: T;
  /** Array of validation error messages (only present if validation fails) */
  errors?: string[];
}

/**
 * Configuration options for schema validation
 */
export interface SchemaValidationOptions {
  /** Whether to enable strict mode in AJV */
  strict?: boolean;
  /** Whether to coerce types during validation */
  coerceTypes?: boolean;
  /** How to handle additional properties in objects */
  removeAdditional?: boolean | 'all' | 'failing';
}

/**
 * Singleton class for handling JSON Schema validation with caching
 */
export class SchemaValidator {
  /** Singleton instance */
  private static instance: SchemaValidator;
  /** AJV instance for schema validation */
  private ajv: Ajv;
  /** Cache of compiled validation functions */
  private validators: Map<string, ValidateFunction> = new Map();

  /**
   * Private constructor to enforce singleton pattern
   * @param options - Configuration options for the validator
   */
  private constructor(options?: SchemaValidationOptions) {
    this.ajv = new Ajv({
      allErrors: true,
      strict: options?.strict ?? false,
      coerceTypes: options?.coerceTypes ?? true,
      removeAdditional: options?.removeAdditional ?? false
    });
    addFormats(this.ajv);
  }

  /**
   * Gets the singleton instance of SchemaValidator
   * @param options - Configuration options for the validator
   * @returns The SchemaValidator instance
   */
  static getInstance(options?: SchemaValidationOptions): SchemaValidator {
    if (!SchemaValidator.instance) {
      SchemaValidator.instance = new SchemaValidator(options);
    }
    return SchemaValidator.instance;
  }

  /**
   * Validates data against a JSON schema
   * @template T - The expected type of the validated data
   * @param schema - The JSON schema to validate against
   * @param payload - The data to validate
   * @returns A ValidationResult containing the result and any errors
   */
  validate<T>(schema: JSONSchemaType<T>, payload: unknown): ValidationResult<T> {
    const schemaKey = JSON.stringify(schema);
    let validate = this.validators.get(schemaKey);
    
    if (!validate) {
      validate = this.ajv.compile(schema);
      this.validators.set(schemaKey, validate);
    }

    const valid = validate(payload);
    
    if (valid) {
      return { valid: true, data: payload as T };
    }

    const errors = (validate.errors || []).map(
      e => `${e.instancePath || '/'} ${e.message}`
    );
    
    return { valid: false, errors };
  }
}

/**
 * Helper function to validate JSON data against a schema
 * @template T - The expected type of the validated data
 * @param schema - The JSON schema to validate against
 * @param payload - The data to validate
 * @param options - Configuration options for validation
 * @returns A ValidationResult containing the result and any errors
 */
export function validateJson<T>(
  schema: JSONSchemaType<T>,
  payload: unknown,
  options?: SchemaValidationOptions
): ValidationResult<T> {
  return SchemaValidator.getInstance(options).validate(schema, payload);
}
