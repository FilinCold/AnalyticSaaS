export function isCredentialsFailure(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const candidate = error as { type?: string; name?: string };
  return (
    candidate.type === 'CredentialsSignin' ||
    candidate.name === 'CredentialsSignin' ||
    candidate.name === 'AuthError'
  );
}
