type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

function formatLog(level: LogLevel, message: string, meta?: unknown): string {
  const timestamp = new Date().toISOString();
  let metaFormatted = '';

  if (meta !== undefined && meta !== null) {
    if (meta instanceof Error) {
      metaFormatted = `\n${meta.stack ?? meta.message}`;
    } else if (typeof meta === 'object') {
      try {
        metaFormatted = ` ${JSON.stringify(meta)}`;
      } catch {
        metaFormatted = ` [Unserializable Object]`;
      }
    } else {
      metaFormatted = ` ${String(meta)}`;
    }
  }

  return `[${timestamp}] [${level}] ${message}${metaFormatted}`;
}

export const logger = {
  debug: (msg: string, meta?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatLog('DEBUG', msg, meta));
    }
  },
  info: (msg: string, meta?: unknown) => {
    console.info(formatLog('INFO', msg, meta));
  },
  warn: (msg: string, meta?: unknown) => {
    console.warn(formatLog('WARN', msg, meta));
  },
  error: (msg: string, meta?: unknown) => {
    console.error(formatLog('ERROR', msg, meta));
  },
};
