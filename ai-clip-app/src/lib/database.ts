import * as SQLite from 'expo-sqlite';
import { Clip, AISource, FilterState } from '../types';

const db = SQLite.openDatabaseSync('aiclip.db');

export function initDatabase(): void {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS clips (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      url TEXT,
      ai_source TEXT NOT NULL DEFAULT 'other',
      project TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      title TEXT NOT NULL,
      note TEXT,
      saved_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_saved_at ON clips(saved_at DESC);
    CREATE INDEX IF NOT EXISTS idx_ai_source ON clips(ai_source);
    CREATE INDEX IF NOT EXISTS idx_project ON clips(project);
  `);
}

function rowToClip(row: Record<string, unknown>): Clip {
  return {
    id: row.id as string,
    content: row.content as string,
    url: (row.url as string | null) ?? undefined,
    aiSource: row.ai_source as AISource,
    project: (row.project as string | null) ?? undefined,
    tags: JSON.parse((row.tags as string) ?? '[]'),
    title: row.title as string,
    note: (row.note as string | null) ?? undefined,
    savedAt: row.saved_at as number,
  };
}

export function saveClip(clip: Clip): void {
  db.runSync(
    `INSERT INTO clips (id, content, url, ai_source, project, tags, title, note, saved_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      clip.id,
      clip.content,
      clip.url ?? null,
      clip.aiSource,
      clip.project ?? null,
      JSON.stringify(clip.tags),
      clip.title,
      clip.note ?? null,
      clip.savedAt,
    ]
  );
}

export function updateClip(clip: Clip): void {
  db.runSync(
    `UPDATE clips
     SET content=?, url=?, ai_source=?, project=?, tags=?, title=?, note=?
     WHERE id=?`,
    [
      clip.content,
      clip.url ?? null,
      clip.aiSource,
      clip.project ?? null,
      JSON.stringify(clip.tags),
      clip.title,
      clip.note ?? null,
      clip.id,
    ]
  );
}

export function deleteClip(id: string): void {
  db.runSync('DELETE FROM clips WHERE id=?', [id]);
}

export function getClip(id: string): Clip | null {
  const row = db.getFirstSync<Record<string, unknown>>(
    'SELECT * FROM clips WHERE id=?',
    [id]
  );
  return row ? rowToClip(row) : null;
}

export function getClips(filter?: FilterState): Clip[] {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filter?.query) {
    conditions.push('(content LIKE ? OR title LIKE ? OR note LIKE ?)');
    const q = `%${filter.query}%`;
    params.push(q, q, q);
  }
  if (filter?.aiSource) {
    conditions.push('ai_source=?');
    params.push(filter.aiSource);
  }
  if (filter?.project) {
    conditions.push('project=?');
    params.push(filter.project);
  }
  if (filter?.dateFrom) {
    conditions.push('saved_at >= ?');
    params.push(filter.dateFrom);
  }
  if (filter?.dateTo) {
    conditions.push('saved_at <= ?');
    params.push(filter.dateTo);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db.getAllSync<Record<string, unknown>>(
    `SELECT * FROM clips ${where} ORDER BY saved_at DESC`,
    params
  );
  return rows.map(rowToClip);
}

export function getClipsByDate(dateStr: string): Clip[] {
  const start = new Date(dateStr).setHours(0, 0, 0, 0);
  const end = new Date(dateStr).setHours(23, 59, 59, 999);
  const rows = db.getAllSync<Record<string, unknown>>(
    'SELECT * FROM clips WHERE saved_at BETWEEN ? AND ? ORDER BY saved_at DESC',
    [start, end]
  );
  return rows.map(rowToClip);
}

export function getClipCountsByDate(): Record<string, number> {
  const rows = db.getAllSync<{ date: string; count: number }>(
    `SELECT strftime('%Y-%m-%d', saved_at / 1000, 'unixepoch', 'localtime') as date,
     COUNT(*) as count
     FROM clips
     GROUP BY date`
  );
  const result: Record<string, number> = {};
  for (const row of rows) {
    result[row.date] = row.count;
  }
  return result;
}

export function getProjects(): string[] {
  const rows = db.getAllSync<{ project: string }>(
    'SELECT DISTINCT project FROM clips WHERE project IS NOT NULL ORDER BY project'
  );
  return rows.map((r) => r.project);
}

export function getAIStats(): Partial<Record<AISource, number>> {
  const rows = db.getAllSync<{ ai_source: string; count: number }>(
    'SELECT ai_source, COUNT(*) as count FROM clips GROUP BY ai_source ORDER BY count DESC'
  );
  const result: Partial<Record<AISource, number>> = {};
  for (const row of rows) {
    result[row.ai_source as AISource] = row.count;
  }
  return result;
}

export function getDailyStats(): Array<{ date: string; count: number }> {
  return db.getAllSync<{ date: string; count: number }>(
    `SELECT strftime('%Y-%m-%d', saved_at / 1000, 'unixepoch', 'localtime') as date,
     COUNT(*) as count
     FROM clips
     GROUP BY date
     ORDER BY date DESC
     LIMIT 30`
  );
}

export function getTotalCount(): number {
  const row = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM clips');
  return row?.count ?? 0;
}
