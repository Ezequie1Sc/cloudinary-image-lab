import { Injectable } from '@angular/core';

import type { ThemedToken } from 'shiki';

export type SyntaxLanguage = 'typescript' | 'html' | 'text';

@Injectable({
  providedIn: 'root',
})
export class SyntaxHighlighterService {
  private highlighterPromise: ReturnType<typeof this.createHighlighter> | undefined;

  private async createHighlighter() {
    const [
      { createHighlighterCore },
      { createJavaScriptRegexEngine },
      { default: darkPlus },
      { default: typescript },
      { default: html },
    ] = await Promise.all([
      import('shiki/core'),
      import('shiki/engine/javascript'),
      import('@shikijs/themes/dark-plus'),
      import('@shikijs/langs/typescript'),
      import('@shikijs/langs/html'),
    ]);

    return createHighlighterCore({
      themes: [darkPlus],

      langs: [typescript, html],

      engine: createJavaScriptRegexEngine(),
    });
  }

  private getHighlighter() {
    if (!this.highlighterPromise) {
      this.highlighterPromise = this.createHighlighter().catch((error: unknown) => {
        this.highlighterPromise = undefined;

        throw error;
      });
    }

    return this.highlighterPromise;
  }

  async highlight(code: string, language: SyntaxLanguage): Promise<ThemedToken[][]> {
    if (language === 'text') {
      return this.createPlainTokens(code);
    }

    try {
      const highlighter = await this.getHighlighter();

      const result = highlighter.codeToTokens(code, {
        lang: language,
        theme: 'dark-plus',
      });

      return result.tokens;
    } catch {
      return this.createPlainTokens(code);
    }
  }

  createPlainTokens(code: string): ThemedToken[][] {
    return code.split(/\r?\n/).map((line) => [
      {
        content: line,
        color: '#D4D4D4',
        offset: 0,
      },
    ]);
  }
}
