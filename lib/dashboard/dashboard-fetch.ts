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

type UploadSignature = {
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: number;
  signature: string;
};

/**
 * Uploads an image straight from the browser to Cloudinary using a server-signed
 * request. The file bytes never pass through our serverless function, so this is
 * not subject to Vercel's request-body limit or function timeout.
 */
export async function dashboardUploadImage(file: File): Promise<{ url: string }> {
  const sigRes = await fetch("/api/dashboard/upload-signature", {
    method: "POST",
  });
  if (!sigRes.ok) throw new Error(await readErrorMessage(sigRes));
  const sig = (await sigRes.json()) as Partial<UploadSignature>;
  if (
    !sig.cloudName ||
    !sig.apiKey ||
    !sig.folder ||
    typeof sig.timestamp !== "number" ||
    !sig.signature
  ) {
    throw new Error("Invalid upload signature response.");
  }

  const body = new FormData();
  body.append("file", file);
  body.append("api_key", sig.apiKey);
  body.append("timestamp", String(sig.timestamp));
  body.append("folder", sig.folder);
  body.append("signature", sig.signature);

  let res: Response;
  try {
    res = await fetch(
      `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
      { method: "POST", body },
    );
  } catch {
    throw new Error("Could not reach the image host. Check your connection.");
  }

  if (!res.ok) {
    let message = "Image upload failed.";
    try {
      const j = (await res.json()) as { error?: { message?: string } };
      if (j.error?.message) message = j.error.message;
    } catch {
      /* keep generic message */
    }
    throw new Error(message);
  }

  const j = (await res.json()) as { secure_url?: string };
  if (!j.secure_url || typeof j.secure_url !== "string") {
    throw new Error("Upload returned no URL.");
  }
  return { url: j.secure_url };
}
