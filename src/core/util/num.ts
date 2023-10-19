export class Num {
  static random(length) {
    let randomNumber = Math.floor(Math.random() * Math.pow(10, length + 3)).toString();
    randomNumber = randomNumber.substring(randomNumber.length - length);

    return randomNumber;
  }

  static round(num: number, precision: number) {
    return precision >= 0 ? +num.toFixed(precision) : num;
  }

  static padDigits(num: number, size = 2): string {
    if (String(num).length >= size) return String(num);

    return String(num).padStart(size, '0');
  }
}
