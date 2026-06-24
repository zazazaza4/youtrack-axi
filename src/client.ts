import { toonError } from './toon.js';
import type { Config } from './config.js';

export class YtError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'YtError';
  }
}

export async function ytGet<T>(
  config: Config,
  path: string,
  fields: string,
  params: Record<string, string> = {}
): Promise<T> {
  const url = new URL(`${config.url}/api${path}`);
  url.searchParams.set('fields', fields);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    return handleError(res, path) as Promise<T>;
  }

  return res.json() as Promise<T>;
}

export async function ytPost<T>(
  config: Config,
  path: string,
  body: unknown,
  fields?: string
): Promise<T> {
  const url = new URL(`${config.url}/api${path}`);
  if (fields) url.searchParams.set('fields', fields);

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return handleError(res, path) as Promise<T>;
  }

  return res.json() as Promise<T>;
}

async function handleError(res: Response, path: string): Promise<never> {
  let message: string;
  try {
    const body = await res.json() as { error_description?: string; error?: string };
    message = body.error_description ?? body.error ?? `HTTP ${res.status}`;
  } catch {
    message = `HTTP ${res.status}`;
  }

  if (res.status === 401 || res.status === 403) {
    toonError('authentication failed — check your token', 'Run `youtrack-axi setup` to reconfigure');
  }

  if (res.status === 404) {
    throw new YtError(404, `not found: ${path}`);
  }

  toonError(message);
}
