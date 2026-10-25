// Solo direcciones HTTPS públicas. Nunca coloques aquí la cadena PostgreSQL.
export const NEON_CONFIG = {
  dataApiUrl: 'https://ep-spring-cell-b4bulegn.apirest.c-6.us-east-2.aws.neon.tech/neondb/rest/v1',
  authUrl: 'https://ep-spring-cell-b4bulegn.neonauth.c-6.us-east-2.aws.neon.tech/neondb/auth',
} as const;

export const catalogConfigured = Boolean(
  /^https:\/\/[^/]+\.apirest\.[^/]+\/[^/]+\/rest\/v1\/?$/i.test(NEON_CONFIG.dataApiUrl) &&
  /^https:\/\/[^/]+\.neonauth\.[^/]+\/[^/]+\/auth\/?$/i.test(NEON_CONFIG.authUrl),
);
