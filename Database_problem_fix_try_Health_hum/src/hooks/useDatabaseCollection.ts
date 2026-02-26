import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteItem, fetchCollection, isDatabaseConfigured, upsertItem, upsertItems } from "@/lib/database";

type AnyRecord = Record<string, unknown>;

interface UseDatabaseCollectionOptions<T extends AnyRecord> {
  collection: string;
  initialData: T[];
  localStorageKey?: string;
  idResolver?: (item: T) => string;
}

const getLocalData = <T>(key: string, fallback: T[]): T[] => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T[]) : fallback;
  } catch {
    return fallback;
  }
};

export function useDatabaseCollection<T extends AnyRecord>({
  collection,
  initialData,
  localStorageKey,
  idResolver,
}: UseDatabaseCollectionOptions<T>) {
  const storageKey = localStorageKey ?? collection;
  const resolveId = useMemo(
    () => idResolver ?? ((item: T) => String(item.id ?? "")),
    [idResolver]
  );
  const [data, setData] = useState<T[]>(() => getLocalData(storageKey, initialData));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data, storageKey]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isDatabaseConfigured) {
      setData(getLocalData(storageKey, initialData));
      setLoading(false);
      return;
    }

    try {
      const remoteData = await fetchCollection<T>(collection);
      if (remoteData.length === 0) {
        const seed = getLocalData(storageKey, initialData);
        if (seed.length > 0) {
          await upsertItems(collection, seed, resolveId);
        }
        setData(seed);
      } else {
        setData(remoteData);
      }
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Unable to load data";
      setError(message);
      setData(getLocalData(storageKey, initialData));
    } finally {
      setLoading(false);
    }
  }, [collection, initialData, resolveId, storageKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const addItem = useCallback(
    async (item: T) => {
      setData((prev) => [...prev, item]);
      if (!isDatabaseConfigured) {
        return;
      }
      try {
        await upsertItem(collection, item, resolveId);
      } catch (addError) {
        const message = addError instanceof Error ? addError.message : "Unable to add record";
        setError(message);
      }
    },
    [collection, resolveId]
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<T>) => {
      let updatedRecord: T | null = null;
      setData((prev) =>
        prev.map((item) => {
          if (resolveId(item) !== id) {
            return item;
          }
          updatedRecord = { ...item, ...updates };
          return updatedRecord;
        })
      );

      if (!isDatabaseConfigured || !updatedRecord) {
        return;
      }

      try {
        await upsertItem(collection, updatedRecord, resolveId);
      } catch (updateError) {
        const message = updateError instanceof Error ? updateError.message : "Unable to update record";
        setError(message);
      }
    },
    [collection, resolveId]
  );

  const removeItem = useCallback(
    async (id: string) => {
      setData((prev) => prev.filter((item) => resolveId(item) !== id));

      if (!isDatabaseConfigured) {
        return;
      }

      try {
        await deleteItem(collection, id);
      } catch (deleteError) {
        const message = deleteError instanceof Error ? deleteError.message : "Unable to delete record";
        setError(message);
      }
    },
    [collection, resolveId]
  );

  const replaceData = useCallback(
    async (nextData: T[]) => {
      setData(nextData);

      if (!isDatabaseConfigured) {
        return;
      }

      try {
        await upsertItems(collection, nextData, resolveId);
      } catch (replaceError) {
        const message = replaceError instanceof Error ? replaceError.message : "Unable to save data";
        setError(message);
      }
    },
    [collection, resolveId]
  );

  return {
    data,
    loading,
    error,
    reload: load,
    setData: replaceData,
    addItem,
    updateItem,
    deleteItem: removeItem,
  };
}

