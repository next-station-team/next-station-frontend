import { useCallback, useEffect, useState } from "react";
import { del, get, set } from "idb-keyval";
import type { Block, Material, Progress, Session, Status } from "./types";

interface Schema {
  session: Session;
  status: Status;
  progress: Progress;
  materials: Material[];
  blocks: Block[];
}

export const load = <K extends keyof Schema>(key: K) => get<Schema[K]>(key);
export const save = <K extends keyof Schema>(key: K, value: Schema[K]) =>
  set(key, value);
export const clear = (key: keyof Schema) => del(key);

export function useStored<K extends keyof Schema>(key: K) {
  const [value, setValue] = useState<Schema[K]>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    load(key).then((v) => {
      setValue(v);
      setReady(true);
    });
  }, [key]);

  const update = useCallback(
    (next: Schema[K]) => {
      setValue(next);
      return save(key, next);
    },
    [key],
  );

  return { value, update, ready };
}
