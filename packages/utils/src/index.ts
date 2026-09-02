export function generateCursor(timestamp: number, id: string): string {
  return Buffer.from(`${timestamp}_${id}`).toString('base64');
}

export function parseCursor(cursor: string): { timestamp: number; id: string } | null {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('ascii');
    const [timestampStr, id] = decoded.split('_');
    const timestamp = parseInt(timestampStr, 10);

    if (isNaN(timestamp) || !id) return null;

    return { timestamp, id };
  } catch {
    return null;
  }
}
