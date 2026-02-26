type AnyRecord = Record<string, unknown>;

interface DbRow<T> {
  collection: string;
  record_id: string;
  payload: T;
}

const SUPABASE_URL = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env
  .VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env
  .VITE_SUPABASE_ANON_KEY;
const TABLE_NAME = "hms_records";

export const isDatabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const buildHeaders = (json = true): HeadersInit => {
  const headers: HeadersInit = {
    apikey: SUPABASE_ANON_KEY ?? "",
    Authorization: `Bearer ${SUPABASE_ANON_KEY ?? ""}`,
  };

  if (json) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Database is not configured");
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, init);

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const payload = await response.json();
      detail = payload?.message || payload?.error || detail;
    } catch {
      // Ignore JSON parsing errors and keep status text.
    }
    throw new Error(detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export const fetchCollection = async <T>(collection: string): Promise<T[]> => {
  const rows = await request<DbRow<T>[]>(
    `${TABLE_NAME}?collection=eq.${encodeURIComponent(collection)}&select=record_id,payload`,
    {
      method: "GET",
      headers: buildHeaders(false),
    }
  );

  return rows.map((row) => row.payload);
};

export const upsertItems = async <T extends AnyRecord>(
  collection: string,
  items: T[],
  idResolver: (item: T) => string
): Promise<void> => {
  if (items.length === 0) {
    return;
  }

  const rows: DbRow<T>[] = items.map((item) => ({
    collection,
    record_id: idResolver(item),
    payload: item,
  }));

  await request<DbRow<T>[]>(
    `${TABLE_NAME}?on_conflict=collection,record_id`,
    {
      method: "POST",
      headers: {
        ...buildHeaders(),
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(rows),
    }
  );
};

export const upsertItem = async <T extends AnyRecord>(
  collection: string,
  item: T,
  idResolver: (item: T) => string
): Promise<void> => {
  await upsertItems(collection, [item], idResolver);
};

export const deleteItem = async (collection: string, recordId: string): Promise<void> => {
  await request<void>(
    `${TABLE_NAME}?collection=eq.${encodeURIComponent(collection)}&record_id=eq.${encodeURIComponent(recordId)}`,
    {
      method: "DELETE",
      headers: buildHeaders(false),
    }
  );
};

