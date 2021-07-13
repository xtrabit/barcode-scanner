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
        console.log('FAILED TO GET DIGIT', group);
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
    const res = [];
    for (let d of digits) {
      const dig = [];
      let dSum = 0;
      for (let m of d) {
        let val = Math.round(m.length / mLength);
        val = val === 0 ? 1 : val;
        // let val = Number((m.length / mLength).toFixed(1));
        dig.push(val);
        dSum += val;
      }
      res.push(dig);
      if (dSum !== 7) {
        console.log('INVALID');
        invalid = true;
      }
    }

    if (invalid) {
      console.log(res);
    }

    return res;
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
