export class Str {
  static random(length, hasNumber = true, moreCharacters?: string) {
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (hasNumber) {
      characters += '0123456789';
    }
    if (moreCharacters) {
      characters += moreCharacters;
    }
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
  }

  static splitUpperWord(word = '') {
    word = word.trim();
    let newWords = (word[0] || '').toUpperCase();
    for (let i = 1; i < word.length; i++) {
      const alpha = word[i];
      if (alpha === alpha.toUpperCase()) {
        newWords += ` ${alpha.toUpperCase()}`;
      } else {
        newWords += alpha;
      }
    }

    return newWords;
  }

  static regexPassword() {
    return /((?=.*\d)(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
  }

  static regexPhoneNumber() {
    return /^\+[0-9]+$/;
  }
}
