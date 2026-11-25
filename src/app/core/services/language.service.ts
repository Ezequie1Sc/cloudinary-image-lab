import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';

export type SupportedLanguage = 'en' | 'es';

export interface TranslationDictionary {
  readonly [key: string]: string | TranslationDictionary;
}

const STORAGE_KEY = 'cil_preferred_language';
const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = ['en', 'es'];

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);

  private readonly cache = new Map<SupportedLanguage, TranslationDictionary>();
  private readonly _language = signal<SupportedLanguage>(this.resolveInitialLanguage());
  private readonly _dictionary = signal<TranslationDictionary>({});
  private readonly _loaded = signal<boolean>(false);

  readonly language = this._language.asReadonly();
  readonly loaded = this._loaded.asReadonly();
  readonly locale = computed(() => (this._language() === 'es' ? 'es-MX' : 'en-US'));

  async init(): Promise<void> {
    await this.loadLanguage(this._language());
  }

  async setLanguage(lang: SupportedLanguage): Promise<void> {
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      return;
    }

    this._language.set(lang);
    this.persistLanguage(lang);
    await this.loadLanguage(lang);
  }

  translate(key: string): string {
    const value = this.resolveKey(this._dictionary(), key);
    return typeof value === 'string' ? value : key;
  }

  formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.locale(), options).format(value);
  }

  updateRouteMetadata(titleKey: string): void {
    const title = this.translate(titleKey);
    const description = this.translate('meta.description');
    if (title !== titleKey) {
      this.titleService.setTitle(title);
    }
    if (description !== 'meta.description') {
      this.metaService.updateTag({ name: 'description', content: description });
    }
  }

  resolveInitialLanguage(): SupportedLanguage {
    const stored = this.readPersistedLanguage();
    if (stored) {
      return stored;
    }

    const browserLang =
      typeof navigator !== 'undefined' ? (navigator.language || '').toLowerCase() : '';
    return browserLang.startsWith('es') ? 'es' : 'en';
  }

  private async loadLanguage(lang: SupportedLanguage): Promise<void> {
    this.document.documentElement.lang = lang;

    const cached = this.cache.get(lang);
    if (cached) {
      this._dictionary.set(cached);
      this._loaded.set(true);
      return;
    }

    try {
      const dictionary = await firstValueFrom(
        this.http.get<TranslationDictionary>(`/i18n/${lang}.json`)
      );
      this.cache.set(lang, dictionary);
      this._dictionary.set(dictionary);
      this._loaded.set(true);
    } catch {
      if (lang !== 'en') {
        await this.loadLanguage('en');
      }
    }
  }

  private resolveKey(
    dictionary: TranslationDictionary,
    path: string
  ): string | TranslationDictionary | undefined {
    return path.split('.').reduce<string | TranslationDictionary | undefined>((acc, segment) => {
      if (acc && typeof acc === 'object' && segment in acc) {
        return acc[segment];
      }
      return undefined;
    }, dictionary);
  }

  private readPersistedLanguage(): SupportedLanguage | null {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === 'en' || value === 'es' ? value : null;
    } catch {
      return null;
    }
  }

  private persistLanguage(lang: SupportedLanguage): void {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore storage quota or private browsing restrictions.
    }
  }
}
