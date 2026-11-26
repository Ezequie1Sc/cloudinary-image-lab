import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { SyntaxHighlighterService } from './services/syntax-highlighter.service';

describe('Code Playground syntax highlighting', () => {
  let service: SyntaxHighlighterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});

    service = TestBed.inject(SyntaxHighlighterService);
  });

  it('creates the syntax highlighting service', () => {
    expect(service).toBeTruthy();
  });

  it('preserves plain text content', () => {
    const code = 'const quality = 80;';

    const tokens = service.createPlainTokens(code);

    expect(tokens).toHaveLength(1);

    expect(tokens[0][0].content).toBe(code);
  });

  it('preserves multiline code and empty lines', () => {
    const code = 'first line\n\nthird line';

    const tokens = service.createPlainTokens(code);

    expect(tokens).toHaveLength(3);

    expect(tokens[0][0].content).toBe('first line');

    expect(tokens[1][0].content).toBe('');

    expect(tokens[2][0].content).toBe('third line');
  });

  it('supports plain text delivery URLs', async () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/sample.jpg';

    const tokens = await service.highlight(url, 'text');

    expect(tokens).toHaveLength(1);

    expect(tokens[0][0].content).toBe(url);
  });

  it('highlights TypeScript using multiple syntax colors', async () => {
    const code = "const message = 'Cloudinary';";

    const tokens = await service.highlight(code, 'typescript');

    const line = tokens[0];

    const reconstructed = line.map((token) => token.content).join('');

    const colors = new Set(line.map((token) => token.color));

    expect(reconstructed).toBe(code);

    expect(colors.size).toBeGreaterThan(1);
  });

  it('highlights HTML using multiple syntax colors', async () => {
    const code = '<img src="sample.jpg" alt="Sample" />';

    const tokens = await service.highlight(code, 'html');

    const line = tokens[0];

    const reconstructed = line.map((token) => token.content).join('');

    const colors = new Set(line.map((token) => token.color));

    expect(reconstructed).toBe(code);

    expect(colors.size).toBeGreaterThan(1);
  });

  it('preserves HTML markup as literal token content', async () => {
    const code = '<script>alert("test")</script>';

    const tokens = await service.highlight(code, 'html');

    const reconstructed = tokens
      .map((line) => line.map((token) => token.content).join(''))
      .join('\n');

    expect(reconstructed).toBe(code);
  });
});