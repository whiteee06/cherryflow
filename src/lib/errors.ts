export type AppErrorKind = 'network' | 'database' | 'authentication' | 'validation' | 'unknown';

export class AppError extends Error {
  kind: AppErrorKind;
  originalError?: any;
  statusCode?: number;

  constructor(message: string, kind: AppErrorKind = 'unknown', originalError?: any, statusCode?: number) {
    super(message);
    this.name = 'AppError';
    this.kind = kind;
    this.originalError = originalError;
    this.statusCode = statusCode;
  }
}

export function handleNetworkError(error: any): AppError {
  console.error('[Network Error]:', error);
  return new AppError(
    error?.message || 'Network connection failed. Please check your connection and try again.',
    'network',
    error
  );
}

export function handleDatabaseError(error: any): AppError {
  const message = error?.message || error?.details || (typeof error === 'string' ? error : 'Database transaction failed.');
  const msgLower = message.toLowerCase();
  const isMissingTable =
    msgLower.includes('schema cache') ||
    msgLower.includes('could not find the table') ||
    (msgLower.includes('relation') && msgLower.includes('does not exist')) ||
    error?.code === 'PGRST204' ||
    error?.code === '42P01';

  if (isMissingTable) {
    console.warn('[Database Notice]: Table not found in schema cache. Falling back to local state.', message);
  } else {
    console.error('[Database Error]:', error);
  }
  return new AppError(message, 'database', error, error?.code);
}

export function handleAuthError(error: any): AppError {
  console.error('[Authentication Error]:', error);
  return new AppError(
    error?.message || 'Authentication failed. Please verify your credentials.',
    'authentication',
    error,
    401
  );
}

export function handleValidationError(message: string, details?: any): AppError {
  console.warn('[Validation Error]:', message, details);
  return new AppError(message, 'validation', details, 400);
}

export function parseSupabaseError(error: any): AppError {
  if (!error) return new AppError('An unknown error occurred.', 'unknown');

  const msg = error.message || String(error);

  if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('networkerror')) {
    return handleNetworkError(error);
  }

  if (msg.toLowerCase().includes('jwt') || msg.toLowerCase().includes('unauthorized') || msg.toLowerCase().includes('invalid login')) {
    return handleAuthError(error);
  }

  return handleDatabaseError(error);
}
