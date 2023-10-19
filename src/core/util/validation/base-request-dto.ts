import { TransformFnParams } from 'class-transformer/types/interfaces';

export class BaseRequestDto {
  static parseMultiQueryParams({ value }: TransformFnParams) {
    if (typeof value === 'string') {
      return value
        .split(',')
        .map(v => v.trim())
        .filter(v => v);
    }

    return value && Array.isArray(value) ? value.map(v => v.trim()) : [value.trim()];
  }

  transformLanguages?() {
    // eslint-disable-next-line no-prototype-builtins
    if (this.hasOwnProperty('languages') && Array.isArray(this['languages'])) {
      const result = {};
      this['languages'].forEach(languageData => {
        const { language, ...data } = languageData;
        result[language] = data;
      });
      this['languages'] = result;

      return this;
    }
  }
}
