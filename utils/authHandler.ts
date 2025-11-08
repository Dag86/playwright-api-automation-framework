/**
 * @fileoverview Authentication utilities for OAuth token handling
 * @module utils/authHandler
 */

import axios from 'axios';

/**
 * Configuration for OAuth client credentials flow
 */
export interface OAuthConfig {
  /** URL of the OAuth token endpoint */
  tokenUrl: string;
  /** OAuth client ID */
  clientId: string;
  /** OAuth client secret */
  clientSecret: string;
  /** Optional OAuth scope */
  scope?: string;
  /** Optional OAuth audience */
  audience?: string;
}

/**
 * Fetches an OAuth token using client credentials flow
 * @param cfg - OAuth configuration
 * @returns Promise resolving to the access token
 * @throws Error if no access token is returned
 */
export async function fetchOAuthToken(cfg: OAuthConfig): Promise<string> {
  // NOTE: For demo purposes only. Replace tokenUrl and fields for your issuer.
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', cfg.clientId);
  params.append('client_secret', cfg.clientSecret);
  if (cfg.scope) params.append('scope', cfg.scope);
  if (cfg.audience) params.append('audience', cfg.audience);

  const { data } = await axios.post(cfg.tokenUrl, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  if (!data.access_token) {
    throw new Error('No access_token in OAuth response');
  }
  return data.access_token as string;
}

/**
 * Checks if a token string is a valid JWT format
 * @param token - The token to validate
 * @returns true if the token matches JWT format (header.payload.signature)
 */
export function isJwt(token: string): boolean {
  return /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(token);
}
