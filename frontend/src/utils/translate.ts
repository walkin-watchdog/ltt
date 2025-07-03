export async function translateFields<T extends object>(
  obj: T,
  fields: (keyof T)[],
  t: (s: string) => Promise<string>
): Promise<T> {
  const entries = await Promise.all(
    Object.entries(obj).map(async ([k, v]) => [
      k,
      fields.includes(k as keyof T) && typeof v === 'string' ? await t(v) : v
    ])
  );
  return Object.fromEntries(entries) as T;
}