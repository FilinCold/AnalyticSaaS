/** User-safe pipeline error messages (no stack traces). */

export function toUserSafePipelineError(err: unknown): string {
  if (err instanceof Error && err.message.trim()) {
    const msg = err.message.trim();
    if (msg.includes('\n') || /\bat\s+\S+\s+\(/.test(msg)) {
      return msg.split('\n')[0]!.trim().slice(0, 500);
    }
    return msg.slice(0, 500);
  }
  return 'Pipeline step failed';
}

export class PipelineStepError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PipelineStepError';
  }
}
