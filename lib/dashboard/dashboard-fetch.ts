async function readErrorMessage(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const j = JSON.parse(text) as { error?: string };
    return j.error ?? text ?? res.statusText;
  } catch {
    return text || res.statusText;
  }
}

/** Dashboard API fetch with JSON body/response (Mongo-backed routes). */
export async function dashboardRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export async function dashboardGet<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json() as Promise<T>;
}

/** Upload an image file to Cloudinary via the dashboard API; returns HTTPS URL. */
export async function dashboardUploadImage(file: File): Promise<{ url: string }> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/dashboard/upload-image", {
    method: "POST",
    body,
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  const j = (await res.json()) as { url?: string };
  if (!j.url || typeof j.url !== "string") {
    throw new Error("Invalid upload response.");
  }
  return { url: j.url };
}
