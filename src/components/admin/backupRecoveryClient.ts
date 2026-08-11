type Fetcher = typeof fetch;

type ErrorResponse = {
  error?: string;
};

async function readJson<T>(response: Response): Promise<T & ErrorResponse> {
  try {
    return (await response.json()) as T & ErrorResponse;
  } catch {
    return {} as T & ErrorResponse;
  }
}

/** Client helpers for post-login backup recovery code setup (CAKE-10). */
export async function generateBackupRecoveryCode(fetcher: Fetcher = fetch) {
  const response = await fetcher("/api/auth/recovery/backup/generate", {
    method: "POST",
    headers: { Accept: "application/json" },
  });
  const body = await readJson<{
    recoveryCode?: string;
    createdAt?: string;
  }>(response);

  if (!response.ok || !body.recoveryCode || !body.createdAt) {
    throw new Error(body.error ?? "Unable to generate recovery code.");
  }

  return {
    recoveryCode: body.recoveryCode,
    createdAt: body.createdAt,
  };
}

/** Confirm that the generated backup code was saved securely. */
export async function confirmBackupRecoveryCode(
  createdAt: string,
  fetcher: Fetcher = fetch,
): Promise<void> {
  const response = await fetcher("/api/auth/recovery/backup/confirm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ createdAt }),
  });
  const body = await readJson<Record<string, never>>(response);

  if (!response.ok) {
    throw new Error(body.error ?? "Unable to confirm recovery code.");
  }
}
