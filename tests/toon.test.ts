import { describe, it, expect, vi, afterEach } from 'vitest';
import { Toon, toonError, toonUsageError, toonEmpty } from '../src/toon.js';

describe('Toon', () => {
  it('renders scalars', () => {
    const t = new Toon();
    t.scalar('id', 'TW-101').scalar('state', 'Open');
    expect(t.toString()).toBe('id: TW-101\nstate: Open');
  });

  it('renders blank line', () => {
    const t = new Toon();
    t.scalar('a', '1').blank().scalar('b', '2');
    expect(t.toString()).toBe('a: 1\n\nb: 2');
  });

  it('renders null as empty string', () => {
    const t = new Toon();
    t.scalar('x', null);
    expect(t.toString()).toBe('x: ');
  });

  it('renders array with header', () => {
    const t = new Toon();
    t.array('issues', ['id', 'summary'], [
      { id: 'TW-1', summary: 'Fix bug' },
      { id: 'TW-2', summary: 'Add feature' },
    ]);
    expect(t.toString()).toBe(
      'issues[2]{id,summary}:\n  TW-1,Fix bug\n  TW-2,Add feature'
    );
  });

  it('shows count line when total differs from displayed', () => {
    const t = new Toon();
    t.array('issues', ['id', 'summary'], [
      { id: 'TW-1', summary: 'Fix bug' },
    ], { total: 100 });
    expect(t.toString()).toContain('count: 1 of 100 total');
  });

  it('does not show count when total equals displayed', () => {
    const t = new Toon();
    t.array('issues', ['id'], [{ id: 'TW-1' }], { total: 1 });
    expect(t.toString()).not.toContain('count:');
  });

  it('quotes values containing commas', () => {
    const t = new Toon();
    t.array('issues', ['id', 'summary'], [
      { id: 'TW-1', summary: 'Fix bug, urgent' },
    ]);
    expect(t.toString()).toContain('"Fix bug, urgent"');
  });

  it('renders null/undefined as empty string in array', () => {
    const t = new Toon();
    t.array('issues', ['id', 'assignee'], [
      { id: 'TW-1', assignee: null },
    ]);
    expect(t.toString()).toContain('TW-1,');
  });

  it('renders help hints', () => {
    const t = new Toon();
    t.help(['Run `foo` to do X', 'Run `bar` to do Y']);
    expect(t.toString()).toBe(
      'help[2]:\n  Run `foo` to do X\n  Run `bar` to do Y'
    );
  });

  it('chains methods and returns correct string', () => {
    const t = new Toon();
    t.scalar('a', 1).blank().scalar('b', 2);
    expect(t.toString()).toBe('a: 1\n\nb: 2');
  });
});

describe('toonError', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('prints error and help then exits 1', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => { throw new Error('exit'); }) as never);
    expect(() => toonError('something failed', 'Run `foo --bar`')).toThrow('exit');
    expect(logSpy).toHaveBeenCalledWith('error: something failed');
    expect(logSpy).toHaveBeenCalledWith('help: Run `foo --bar`');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('skips help line when none provided', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation((() => { throw new Error('exit'); }) as never);
    expect(() => toonError('oops')).toThrow('exit');
    expect(logSpy).toHaveBeenCalledTimes(1);
  });
});

describe('toonUsageError', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('exits 2', () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => { throw new Error('exit'); }) as never);
    expect(() => toonUsageError('--summary is required')).toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(2);
  });
});

describe('toonEmpty', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('prints label: message', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    toonEmpty('issues', '0 open issues found');
    expect(logSpy).toHaveBeenCalledWith('issues: 0 open issues found');
  });
});
