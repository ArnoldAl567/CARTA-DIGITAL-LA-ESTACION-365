import { put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { NEON_CONFIG } from '../src/app/config/neon.config.js';

const MAX_IMAGE_BYTES = 1024 * 1024;

type Request = IncomingMessage & { body?: unknown };

function respond(response: ServerResponse, status: number, message: string): void {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify({ message }));
}

async function readImage(request: Request): Promise<Buffer> {
  if (Buffer.isBuffer(request.body)) return request.body;
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of request) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += bytes.length;
    if (total > MAX_IMAGE_BYTES) throw new Error('La fotografía es demasiado grande.');
    chunks.push(bytes);
  }
  return Buffer.concat(chunks);
}

export default async function handler(request: Request, response: ServerResponse): Promise<void> {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    respond(response, 405, 'Método no permitido.');
    return;
  }
  if (!process.env['BLOB_READ_WRITE_TOKEN']) {
    respond(response, 503, 'El almacenamiento de fotos todavía no está configurado.');
    return;
  }
  const authorization = request.headers.authorization;
  if (typeof authorization !== 'string' || !/^Bearer [A-Za-z0-9._-]+$/.test(authorization)) {
    respond(response, 401, 'Inicia sesión para subir fotografías.');
    return;
  }

  try {
    const adminResponse = await fetch(`${NEON_CONFIG.dataApiUrl}/catalog_admins?select=user_id&limit=1`, {
      headers: { Authorization: authorization },
      signal: AbortSignal.timeout(8_000),
      cache: 'no-store',
    });
    if (!adminResponse.ok) {
      respond(response, 401, 'La sesión no es válida. Vuelve a iniciar sesión.');
      return;
    }
    const admins = await adminResponse.json() as unknown;
    if (!Array.isArray(admins) || admins.length === 0) {
      respond(response, 403, 'Esta cuenta no tiene permiso para subir fotografías.');
      return;
    }
    if (request.headers['content-type'] !== 'image/webp') {
      respond(response, 415, 'Solo se aceptan fotografías WebP.');
      return;
    }
    const image = await readImage(request);
    if (image.length === 0 || image.length > MAX_IMAGE_BYTES ||
        image.toString('ascii', 0, 4) !== 'RIFF' || image.toString('ascii', 8, 12) !== 'WEBP') {
      respond(response, 400, 'La fotografía WebP no es válida o supera el límite de tamaño.');
      return;
    }

    const stored = await put(`catalog/${randomUUID()}.webp`, image, {
      access: 'public',
      contentType: 'image/webp',
      addRandomSuffix: false,
    });
    response.statusCode = 201;
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.end(JSON.stringify({ url: stored.url }));
  } catch (error) {
    if (error instanceof Error && error.message === 'La fotografía es demasiado grande.') {
      respond(response, 413, error.message);
      return;
    }
    respond(response, 502, 'No se pudo guardar la fotografía. Inténtalo de nuevo.');
  }
}
