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

    let res = '';

    for (let i = 0; i < converted.length; i++) {
      const group = converted[i];
      const digit = this.getDigit(group);
      if (typeof digit !== 'number') {
        console.log('FAILED TO GET DIGIT', i, group);
        return;
      }
      res += digit;
    }
    console.log('DIGITS', res);
    return res;
  }

  getDigit(group) {
    let res = numbersF;

    for (let i = 0; i < group.length; i++) {
      const digit = group[i];
      if (!['number', 'object'].includes(typeof res[digit])) break;

      res = res[digit];
      if (i === group.length - 1) return res;
    }
    res = numbersF;

    for (let i = group.length - 1; i >= 0; i--) {
      const digit = group[i];
      if (!['number', 'object'].includes(typeof res[digit])) break;

      res = res[digit];
      if (i === 0) return res;
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
    console.log('NORMALIZING', i);
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
    console.log('normalized', Number(digit[0].length.toFixed(2)), Number(digit[1].length.toFixed(2)), Number(digit[2].length.toFixed(2)), Number(digit[3].length.toFixed(2)));
    if (sum !== 7) {
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
    }
    console.log('corrected', Number(digit[0].length.toFixed(2)), Number(digit[1].length.toFixed(2)), Number(digit[2].length.toFixed(2)), Number(digit[3].length.toFixed(2)));
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

}

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
