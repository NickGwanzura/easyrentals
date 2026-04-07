/**
 * Neon-backed database client with a Supabase-compatible query interface.
 * Auth is handled by Auth0 — this file covers data-layer queries only.
 */
import { sql } from '@/lib/db/client';

// ── Tiny Supabase-compatible query builder backed by Neon SQL ──────────────

type SupabaseResult<T = any> = Promise<{ data: T | null; error: Error | null }>;

class QueryBuilder {
  private _table: string;
  private _filters: Array<{ col: string; op: string; val: any }> = [];
  private _select = '*';
  private _orderCol?: string;
  private _orderAsc = true;
  private _limitN?: number;
  private _single = false;
  private _maybeSingle = false;
  private _insertData?: any;
  private _updateData?: any;
  private _upsertData?: any;
  private _upsertConflict?: string;
  private _deleteMode = false;

  constructor(table: string) {
    this._table = table;
  }

  select(cols: string) { this._select = cols; return this; }

  eq(col: string, val: any)  { this._filters.push({ col, op: '=',   val }); return this; }
  neq(col: string, val: any) { this._filters.push({ col, op: '!=',  val }); return this; }
  is(col: string, val: any)  { this._filters.push({ col, op: 'IS',  val }); return this; }
  in(col: string, vals: any[]) { this._filters.push({ col, op: 'IN', val: vals }); return this; }

  order(col: string, opts?: { ascending?: boolean }) {
    this._orderCol = col;
    this._orderAsc = opts?.ascending ?? true;
    return this;
  }
  limit(n: number)      { this._limitN = n; return this; }
  single()              { this._single = true; return this; }
  maybeSingle()         { this._maybeSingle = true; return this; }

  insert(data: any)     { this._insertData = data; return this; }
  update(data: any)     { this._updateData = data; return this; }
  delete()              { this._deleteMode = true; return this; }

  upsert(data: any, opts?: { onConflict?: string }) {
    this._upsertData = data;
    this._upsertConflict = opts?.onConflict;
    return this;
  }

  // Execute query
  then(resolve: (v: { data: any; error: any }) => any, reject?: (e: any) => any): Promise<any> {
    return this._execute().then(resolve, reject);
  }

  private async _execute(): SupabaseResult {
    try {
      // Build WHERE clause
      const wheres: string[] = [];
      const vals: any[] = [];
      let idx = 1;
      for (const f of this._filters) {
        if (f.op === 'IN') {
          const placeholders = f.val.map((_: any) => `$${idx++}`).join(', ');
          vals.push(...f.val);
          wheres.push(`"${f.col}" IN (${placeholders})`);
        } else if (f.op === 'IS') {
          wheres.push(`"${f.col}" IS ${f.val === null ? 'NULL' : 'NOT NULL'}`);
        } else {
          wheres.push(`"${f.col}" ${f.op} $${idx++}`);
          vals.push(f.val);
        }
      }
      const WHERE = wheres.length ? `WHERE ${wheres.join(' AND ')}` : '';

      // DELETE
      if (this._deleteMode) {
        await sql(`DELETE FROM "${this._table}" ${WHERE}`, vals);
        return { data: null, error: null };
      }

      // INSERT
      if (this._insertData) {
        const data = Array.isArray(this._insertData) ? this._insertData : [this._insertData];
        const cols = Object.keys(data[0]);
        const colStr = cols.map(c => `"${c}"`).join(', ');
        const allVals: any[] = [];
        const rowPlaceholders = data.map((row: any) => {
          const start = allVals.length + 1;
          cols.forEach(c => allVals.push(row[c]));
          return `(${cols.map((_, i) => `$${start + i}`).join(', ')})`;
        });
        const rows = await sql(
          `INSERT INTO "${this._table}" (${colStr}) VALUES ${rowPlaceholders.join(', ')} RETURNING *`,
          allVals
        );
        if (this._single || this._maybeSingle) return { data: rows[0] ?? null, error: null };
        return { data: rows, error: null };
      }

      // UPSERT
      if (this._upsertData) {
        const d = this._upsertData;
        const cols = Object.keys(d);
        const colStr = cols.map(c => `"${c}"`).join(', ');
        const phs = cols.map((_, i) => `$${i + 1}`).join(', ');
        const conflict = this._upsertConflict ? `("${this._upsertConflict}")` : '';
        const updates = cols
          .filter(c => c !== this._upsertConflict)
          .map(c => `"${c}" = EXCLUDED."${c}"`)
          .join(', ');
        const rows = await sql(
          `INSERT INTO "${this._table}" (${colStr}) VALUES (${phs})
           ON CONFLICT ${conflict} DO UPDATE SET ${updates}
           RETURNING *`,
          cols.map(c => d[c])
        );
        return { data: rows[0] ?? null, error: null };
      }

      // UPDATE
      if (this._updateData) {
        const d = this._updateData;
        const setCols = Object.keys(d);
        const setParts = setCols.map((c, i) => `"${c}" = $${i + 1}`).join(', ');
        const setVals = setCols.map(c => d[c]);
        // Rebuild filter placeholders offset by setVals length
        const whereVals: any[] = [];
        const whereParts: string[] = [];
        let wi = setVals.length + 1;
        for (const f of this._filters) {
          if (f.op === 'IS') {
            whereParts.push(`"${f.col}" IS ${f.val === null ? 'NULL' : 'NOT NULL'}`);
          } else {
            whereParts.push(`"${f.col}" ${f.op} $${wi++}`);
            whereVals.push(f.val);
          }
        }
        const W = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';
        const rows = await sql(
          `UPDATE "${this._table}" SET ${setParts} ${W} RETURNING *`,
          [...setVals, ...whereVals]
        );
        if (this._single || this._maybeSingle) return { data: rows[0] ?? null, error: null };
        return { data: rows, error: null };
      }

      // SELECT
      let query = `SELECT ${this._select} FROM "${this._table}" ${WHERE}`;
      if (this._orderCol) query += ` ORDER BY "${this._orderCol}" ${this._orderAsc ? 'ASC' : 'DESC'}`;
      if (this._limitN)   query += ` LIMIT ${this._limitN}`;

      const rows = await sql(query, vals);

      if (this._single)      return { data: rows[0] ?? null, error: null };
      if (this._maybeSingle) return { data: rows[0] ?? null, error: null };
      return { data: rows, error: null };

    } catch (err: any) {
      return { data: null, error: err };
    }
  }
}

// ── Auth shim (no-op — real auth handled by Auth0 middleware) ──────────────

const noopAuth = {
  getSession: () => Promise.resolve({ data: { session: null }, error: null }),
  getUser:    () => Promise.resolve({ data: { user: null },    error: null }),
  signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Use Auth0 login: /auth/login') }),
  signUp:      () => Promise.resolve({ data: null, error: new Error('Use Auth0 signup: /auth/login?screen_hint=signup') }),
  signOut:     () => Promise.resolve({ error: null }),
  resetPasswordForEmail: () => Promise.resolve({ error: null }),
  updateUser:  () => Promise.resolve({ data: null, error: null }),
  onAuthStateChange: (_cb: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
};

export const supabase: any = {
  auth: noopAuth,
  from: (table: string) => new QueryBuilder(table),
};

export function createClient() {
  return supabase;
}
