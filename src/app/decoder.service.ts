import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DecoderService {

  constructor() { }

  decode(bars) {
    // console.log(bars)
    if (bars.length !== 53) return;

    const digits = this.split(bars);
    // console.log(digits);

    const mLength = this.getModuleLength(bars);
    const converted = this.convertToModules(digits, mLength);
    // console.log(mLength, converted);

    let res: any = [];
    let dir = 0;
    let parity: any = [];
    let EAN13 = false;

    for (let i = 0; i < converted.length; i++) {
      const group = converted[i];
      const digit = this.getDigit(group);
      if (!digit) {
        console.log('FAILED TO GET DIGIT', i, group);
        return;
      }
      res.push(digit.val);
      if (i === 0) {
        dir = digit.dir;
      }
      parity.push(digit.dir);
    }
    if (dir === 1) {
      res.reverse();
      parity.reverse();
    }
    res = res.join('');
    parity = parseInt(parity.slice(0, 6).join(''), 2);
    let valid = true;
    if (parity !== 63 && parity !== 0) {
      // got an EAN13
      // if we started in reverse, need to flip the digits e.g.: 100000 => 011111
      parity = parity > 31 ? parity ^ 63 : parity;
      if (parity in parityEAN) {
        EAN13 = true;
        res = parityEAN[parity] + res;
      }
      else {
        console.error('INVALID EAN13 ENCODING');
        valid = false;
      }

    }
    // const valid = true;
    if (valid) {
      valid = this.checkDigits(res);
    }
    // console.log(valid ? 'VALID' : 'INVALID', 'BARCODE', EAN13 ? 'EAN13' : 'UPCA', res);
    return {
      type: EAN13 ? 'EAN13' : 'UPCA',
      valid,
      value: res,
    };
    // return res;
  }

  getDigit(group) {
    let res = numbersF;

    for (let i = 0; i < group.length; i++) {
      const digit = group[i];
      if (!['number', 'object'].includes(typeof res[digit])) break;

      res = res[digit];
      if (i === group.length - 1) {
        return {
          val: res,
          dir: 0,
        };
      }
    }
    res = numbersF;

    for (let i = group.length - 1; i >= 0; i--) {
      const digit = group[i];
      if (!['number', 'object'].includes(typeof res[digit])) break;

      res = res[digit];
      if (i === 0) {
        return {
          val: res,
          dir: 1,
        };
      }
    }

    return null;
  }

  convertToModules(digits, mLength) {
    let invalid = false;
    const orig = [];
    const res = [];
    // for (let d of digits) {
    for (let i = 0; i < digits.length; i++) {
      let d = digits[i];
      this.normalizeDigit(d, i);
      const dig = [];
      const o = [];
      let dSum = 0;
      for (let m of d) {
        let val = Math.round(m.length);
        // let val = Math.round(m.length / mLength);
        // val = val === 0 ? 1 : val;
        // let valo = m.length;
        let valo = Number(m.length.toFixed(3));
        // let valo = Number((m.length / mLength).toFixed(1));
        valo = m.val ? valo : -valo;
        // console.log(m)
        dig.push(val);
        o.push(valo);
        dSum += val;
      }
      res.push(dig);
      orig.push(o);
      if (dSum !== 7) {
        // console.log(dig);
        console.log('INVALID');
        invalid = true;
      }
    }

    if (invalid) {
      for (let d of orig) {
        console.log(d, Number((Math.abs(d[0]) + Math.abs(d[1]) + Math.abs(d[2]) + Math.abs(d[3])).toFixed(2)));
      }
      // console.log(orig);
      // console.log(res);
    }

    return res;
  }

  normalizeDigit(digit, i) {
    let sum = 0;
    for (let d of digit) {
      sum += d.length;
    }
    // console.log(sum);
    const correction = 7 / sum;
    sum = 0;
    for (let d of digit) {
      d.length *= correction;
      sum += Math.round(d.length);
    }
    if (sum !== 7) {
      console.log('NORMALIZING', i);
      console.log('normalized', Number(digit[0].length.toFixed(2)), Number(digit[1].length.toFixed(2)), Number(digit[2].length.toFixed(2)), Number(digit[3].length.toFixed(2)));
      console.log('---', sum, digit);

      let min = Infinity;
      let minI = -1;
      let max = 0;
      let maxI = -1;
      for (let i = 0; i < digit.length; i++) {
        const d = digit[i];
        if (d.length < min) {
          min = d.length;
          minI = i;
        }
        if (d.length > max) {
          max = d.length;
          maxI = i;
        }
      }
      console.log('min', min, 'max', max);
      if (min < 1) {
        let comp = 1 - min;
        comp = comp === 0.5 ? 0.49 : comp;
        for (let i = 0; i < digit.length; i++) {
          if (i % 2 === minI % 2) {
            digit[i].length += comp;
          }
          else {
            digit[i].length -= comp;
          }
        }
      }
      else if (min > 1) {
        let comp = min - 1;
        comp = comp === 0.5 ? 0.49 : comp;
        for (let i = 0; i < digit.length; i++) {
          if (i % 2 === minI % 2) {
            digit[i].length -= comp;
          }
          else {
            digit[i].length += comp;
          }
        }
      }
      else if (sum > 7) {
        let comp = max - Math.floor(max);
        comp = comp === 0.5 ? 0.49 : comp;
        console.log('comp', comp);
        for (let i = 0; i < digit.length; i++) {
          if (i % 2 === maxI % 2) {
            digit[i].length -= comp;
          }
          else {
            digit[i].length += comp;
          }
        }
      }
      console.log('corrected', Number(digit[0].length.toFixed(2)), Number(digit[1].length.toFixed(2)), Number(digit[2].length.toFixed(2)), Number(digit[3].length.toFixed(2)));
    }
  }

  getTotalLength(bars) {
    let sum = 0;
    for (let bar of bars) {
      sum += bar.length;
    }
    return sum;
  }

  getModuleLength(bars) {
    return this.getTotalLength(bars) / 89;
  }

  split(bars) {
    const digits = [];
    for (let i = 0; i < 24; i += 4) {
      digits.push(bars.slice(i, i + 4));
    }
    // can check middle here
    for (let i = 29; i < bars.length; i += 4) {
      digits.push(bars.slice(i, i + 4));
    }
    return digits;
  }

  checkDigits(digits) {
    const d = digits.split('').map((d) => Number(d));
    let sum;
    if (digits.length === 12) {
      sum = d[0] * 3 + d[1] + d[2] * 3 + d[3] + d[4] * 3 + d[5] + d[6] * 3 + d[7] + d[8] * 3 + d[9] + d[10] * 3 + d[11];
    }
    else if (digits.length === 13) {
      sum = d[0] + d[1] * 3 + d[2] + d[3] * 3 + d[4] + d[5] * 3 + d[6] + d[7] * 3 + d[8] + d[9] * 3 + d[10] + d[11] * 3 + d[12];
    }
    return sum % 10 === 0;
  }

}

const parityEAN = {
  0: 0,
  11: 1,
  13: 2,
  14: 3,
  19: 4,
  25: 5,
  28: 6,
  21: 7,
  22: 8,
  26: 9,
};

const numbersF = {
  1: {
    1: {
      1: {
        4: 6,
      },
      3: {
        2: 4,
      },
    },
    2: {
      1: {
        3: 8,
      },
      3: {
        1: 5,
      },
    },
    3: {
      1: {
        2: 7,
      },
    },
    4: {
      1: {
        1: 3,
      },
    },
  },
  2: {
    1: {
      2: {
        2: 2,
      },
    },
    2: {
      2: {
        1: 1,
      },
    },
  },
  3: {
    1: {
      1: {
        2: 9,
      },
    },
    2: {
      1: {
        1: 0,
      },
    },
  },
};
