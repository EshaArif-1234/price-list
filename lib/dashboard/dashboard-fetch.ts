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
 *
 * Uses `XMLHttpRequest` (not `fetch`) for the Cloudinary PUT so we can report
 * real upload progress via `onProgress` (0–100). `onProgress` is called with the
 * percentage of bytes sent; when the file size is unknown it is not called.
 */
export async function dashboardUploadImage(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<{ url: string }> {
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

  const endpoint = `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`;

  return new Promise<{ url: string }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) return;
      const percent = Math.round((event.loaded / event.total) * 100);
      onProgress(Math.min(100, Math.max(0, percent)));
    };

    xhr.onerror = () =>
      reject(new Error("Could not reach the image host. Check your connection."));
    xhr.ontimeout = () =>
      reject(new Error("The image upload timed out. Please try again."));

    xhr.onload = () => {
      let parsed: { secure_url?: string; error?: { message?: string } } = {};
      try {
        parsed = JSON.parse(xhr.responseText);
      } catch {
        /* fall through to status handling */
      }

      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(parsed.error?.message || "Image upload failed."));
        return;
      }

      if (!parsed.secure_url || typeof parsed.secure_url !== "string") {
        reject(new Error("Upload returned no URL."));
        return;
      }

      onProgress?.(100);
      resolve({ url: parsed.secure_url });
    };

    xhr.send(body);
  });
}
