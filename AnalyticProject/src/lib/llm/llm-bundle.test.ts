import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

function walkFiles(dir: string, out: string[] = []): string[] {
  if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) return out;
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walkFiles(full, out);
    else out.push(full);
  }
  return out;
}

describe('LLM client bundle guard (F8-01 T2)', () => {
  it('client components do not import @/lib/llm', () => {
    const componentsDir = path.join(process.cwd(), 'src', 'components');
    const files = walkFiles(componentsDir).filter((f) =>
      /\.(tsx|ts|jsx|js)$/.test(f),
    );
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      expect(text, file).not.toMatch(/from\s+['"]@\/lib\/llm/);
    }
  });

  it('built client assets do not embed LLM API key literals (when .next exists)', () => {
    const nextStatic = path.join(process.cwd(), '.next', 'static');
    if (!statSync(nextStatic, { throwIfNoEntry: false })?.isDirectory()) {
      return;
    }
    const forbidden = [
      /LLM_API_KEY\s*=\s*['"][^'"]+['"]/,
      /sk-or-v1-[a-zA-Z0-9]{20,}/,
    ];
    const files = walkFiles(nextStatic).filter((f) =>
      /\.(js|css|html)$/.test(f),
    );
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      for (const re of forbidden) {
        expect(text, file).not.toMatch(re);
      }
    }
  });
});
