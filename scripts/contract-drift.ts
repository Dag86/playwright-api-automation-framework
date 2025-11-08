/**
 * @fileoverview Contract Drift Detection Script
 * @module scripts/contract-drift
 * 
 * This script detects if there are any uncommitted changes to the OpenAPI contract file.
 * It's typically used in CI/CD pipelines to ensure contract changes are properly reviewed
 * and committed before deployment.
 * 
 * Exit codes:
 * - 0: No drift detected
 * - 2: Contract drift detected (changes present in openapi.json)
 */

import { execSync } from 'node:child_process';

/**
 * Check for changes in the OpenAPI contract file
 * Uses git diff to detect modifications against HEAD
 */
try {
  // Execute git diff with --quiet flag to check for changes
  // --quiet exits with 1 if there are differences and 0 if none
  execSync('git diff --quiet -- contracts/openapi.json', { stdio: 'inherit' });
  console.log('[contracts] No drift detected (openapi.json unchanged vs HEAD).');
} catch (_) {
  // If git diff exits with non-zero, changes were detected
  console.error('[contracts] Drift detected in contracts/openapi.json');
  process.exit(2); // Exit with code 2 to indicate contract drift
}
