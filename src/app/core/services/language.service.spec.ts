import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import enTranslations from '../../../../public/i18n/en.json';
import esTranslations from '../../../../public/i18n/es.json';
import { LanguageService } from './language.service';

function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return collectKeys(value as Record<string, unknown>, fullKey);
    }
    return [fullKey];
  });
}

describe('LanguageService & i18n parity', () => {
  let service: LanguageService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), LanguageService],
    });
    service = TestBed.inject(LanguageService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('has identical translation keys in en.json and es.json', () => {
    const enKeys = collectKeys(enTranslations as Record<string, unknown>).sort();
    const esKeys = collectKeys(esTranslations as Record<string, unknown>).sort();

    expect(enKeys).toEqual(esKeys);
    expect(enKeys.length).toBeGreaterThan(50);
  });

  it('switches language dynamically, updates document lang, and persists to localStorage', async () => {
    const promise = service.setLanguage('es');
    const req = httpMock.expectOne('/i18n/es.json');
    req.flush(esTranslations);
    await promise;

    expect(service.language()).toBe('es');
    expect(localStorage.getItem('cil_preferred_language')).toBe('es');
    expect(document.documentElement.lang).toBe('es');
    expect(service.translate('hero.title')).toBe('Menos peso. Mismo impacto.');
  });
});
