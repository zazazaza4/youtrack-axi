export type ToonValue = string | number | boolean | null | undefined;

export class Toon {
  private lines: string[] = [];

  scalar(key: string, value: ToonValue): this {
    const v = value == null ? '' : String(value);
    this.lines.push(`${key}: ${v}`);
    return this;
  }

  blank(): this {
    this.lines.push('');
    return this;
  }

  array(
    label: string,
    fields: string[],
    rows: Record<string, ToonValue>[],
    opts: { total?: number } = {}
  ): this {
    this.lines.push(`${label}[${rows.length}]{${fields.join(',')}}:`);
    for (const row of rows) {
      const vals = fields.map(f => {
        const v = row[f];
        const s = v == null ? '' : String(v);
        return s.includes(',') ? `"${s.replace(/"/g, '""')}"` : s;
      });
      this.lines.push(`  ${vals.join(',')}`);
    }
    if (opts.total !== undefined && opts.total !== rows.length) {
      this.lines.push(`count: ${rows.length} of ${opts.total} total`);
    }
    return this;
  }

  help(hints: string[]): this {
    this.lines.push(`help[${hints.length}]:`);
    for (const h of hints) {
      this.lines.push(`  ${h}`);
    }
    return this;
  }

  toString(): string {
    return this.lines.join('\n');
  }

  print(): void {
    console.log(this.toString());
  }
}

export function toonError(message: string, help?: string): never {
  console.log(`error: ${message}`);
  if (help) console.log(`help: ${help}`);
  process.exit(1);
}

export function toonUsageError(message: string, help?: string): never {
  console.log(`error: ${message}`);
  if (help) console.log(`help: ${help}`);
  process.exit(2);
}

export function toonEmpty(label: string, message: string): void {
  console.log(`${label}: ${message}`);
}
