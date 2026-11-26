import { Injectable } from '@angular/core';

import type { HighlighterCore, ThemedToken } from 'shiki';

export type SyntaxLanguage = 'typescript' | 'html' | 'text';

const SYNTAX_THEME = 'dark-plus';
const PLAIN_TEXT_COLOR = '#D4D4D4';

@Injectable({
  providedIn: 'root',
})
export class SyntaxHighlighterService {
  private static highlighterPromise: Promise<HighlighterCore> | undefined;

  private async createHighlighter(): Promise<HighlighterCore> {
    const [
      { createHighlighterCore },
      { createOnigurumaEngine },
      { default: darkPlus },
      { default: typescript },
      { default: html },
    ] = await Promise.all([
      import('shiki/core'),
      import('shiki/engine/oniguruma'),
      import('@shikijs/themes/dark-plus'),
      import('@shikijs/langs/typescript'),
      import('@shikijs/langs/html'),
    ]);

    return createHighlighterCore({
      themes: [darkPlus],
      langs: [typescript, html],
      engine: createOnigurumaEngine(import('shiki/wasm')),
    });
  }

  private getHighlighter(): Promise<HighlighterCore> {
    if (!SyntaxHighlighterService.highlighterPromise) {
      SyntaxHighlighterService.highlighterPromise = this.createHighlighter().catch(
        (error: unknown) => {
          SyntaxHighlighterService.highlighterPromise = undefined;

          throw error;
        }
      );
    }

    return SyntaxHighlighterService.highlighterPromise;
  }

  async highlight(code: string, language: SyntaxLanguage): Promise<ThemedToken[][]> {
    if (language === 'text') {
      return this.createPlainTokens(code);
    }

    try {
      const highlighter = await this.getHighlighter();

      const result = highlighter.codeToTokens(code, {
        lang: language,
        theme: SYNTAX_THEME,
      });

      return result.tokens;
    } catch (error: unknown) {
      console.error(`[Cloudinary Image Lab] Syntax highlighting failed for ${language}:`, error);

      return this.createPlainTokens(code);
    }
  }

  createPlainTokens(code: string): ThemedToken[][] {
    return code.split(/\r?\n/).map((line) => [
      {
        content: line,
        color: PLAIN_TEXT_COLOR,
        offset: 0,
      },
    ]);
  }
}
