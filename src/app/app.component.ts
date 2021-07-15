import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { DecoderService } from './decoder.service';
import test_image1 from '../assets/test_image1.js';

let skipLinesConst = 20;

const threshold = 160;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit{

  message = 'no message';
  imagePath;
  imgURL;
  public angle = 10;

  originalImage;
  midW;
  midH;
  radius;

  sliderValue = 0;
  endsCount = 0;
  rAve = 0;
  maxOcc = 0;
  maxOccVal = 0;

  slice = [];


  H;
  W;
  step;
  image;
  data;
  inflection;
  negInflection;
  radians = 180 / Math.PI;
  angleStep = 3;

  // center;
  center = {
    x: 0,
    y: 0,
  };

  angleInput = {
    from: 0,
    to: 180,
    step: 3,
  };

  threshold = 130;
  errCoeficient = 1;

  bars = [];


  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvas2') canvas2: ElementRef<HTMLCanvasElement>;
  ctx: CanvasRenderingContext2D;
  ctx2: CanvasRenderingContext2D;
  vctx: CanvasRenderingContext2D;
  vcanvas;

  constructor(private decoder: DecoderService) {}

  ngOnInit(): void {
    // this.ctx = this.canvas.nativeElement.getContext('2d');
  }

  ngAfterViewInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.ctx2 = this.canvas2.nativeElement.getContext('2d');
    this.ctx2.save();
    this.vcanvas = document.createElement('canvas');
    this.vctx = this.vcanvas.getContext('2d');
    this.vctx.save();

    this.load();
  }

  testIterator() {
    this.H = this.ctx.canvas.height;
    this.W = this.ctx.canvas.width;

    this.image = this.ctx.getImageData(0, 0, this.W, this.H);
    this.data = this.image.data;
    this.step = this.W * 4;

    const gt = this.angleInput.from < this.angleInput.to && this.angleInput.step > 0;
    const lt = this.angleInput.from > this.angleInput.to && this.angleInput.step < 0;

    if (!gt && !lt) return;

    for (let a = this.angleInput.from; gt ? (a < this.angleInput.to ? true : false) : (a > this.angleInput.to ? true : false); a += this.angleInput.step) {

      const params = this.getIterationParams(a, this.center.x, this.center.y);

      for (let p = 0; p < params.length; p++) {
        const i = params.getIndex(p, this.step);

        if (p < 10) {
          toGreen(this.data, i);
        }
        else {
          toRed(this.data, i);
        }
      }

    }

    this.ctx.putImageData(this.image, 0, 0);
  }

  findThreshold() {
    // pretty bad implementation

    let sum = 0;
    let count = 0;
    let minV = Infinity;
    let maxV = 0;
    for (let i = this.W * 2; i < this.data.length; i += this.step) {
      const val = getValue(this.data, i);
      sum += val;
      count++;
      maxV = Math.max(maxV, val);
      minV = Math.min(minV, val);
    }
    let thV = Math.floor(sum / count);
    let aveV = Math.floor((maxV + minV) / 2);
    // console.log('THRESHOLD V', thV, aveV);

    sum = 0;
    count = 0;
    let minV1 = Infinity;
    let maxV1 = 0;
    for (let i = this.W; i < this.data.length; i += this.step) {
      const val = getValue(this.data, i);
      sum += val;
      count++;
      maxV1 = Math.max(maxV1, val);
      minV1 = Math.min(minV1, val);
    }
    let thV1 = Math.floor(sum / count);
    let aveV1 = Math.floor((maxV1 + minV1) / 2);

    sum = 0;
    count = 0;
    let minV2 = Infinity;
    let maxV2 = 0;
    for (let i = this.W * 3; i < this.data.length; i += this.step) {
      const val = getValue(this.data, i);
      sum += val;
      count++;
      maxV2 = Math.max(maxV2, val);
      minV2 = Math.min(minV2, val);
    }
    let thV2 = Math.floor(sum / count);
    let aveV2 = Math.floor((maxV2 + minV2) / 2);


    sum = 0;
    count = 0;
    let minH = Infinity;
    let maxH = 0;
    let start = this.W * 4 * this.H / 2
    for (let i = start; i < start + this.step; i += 4) {
      const val = getValue(this.data, i);
      sum += val;
      count++;
      maxH = Math.max(maxH, val);
      minH = Math.min(minH, val);
    }
    let thH = Math.floor(sum / count);
    let aveH = Math.floor((maxH + minH) / 2);
    // console.log('THRESHOLD H', thH, aveH);

    sum = 0;
    count = 0;
    let minH1 = Infinity;
    let maxH1 = 0;
    start = Math.floor(this.W * 4 * this.H / 3);
    for (let i = start; i < start + this.step; i += 4) {
      const val = getValue(this.data, i);
      sum += val;
      count++;
      maxH1 = Math.max(maxH1, val);
      minH1 = Math.min(minH1, val);
    }
    let thH1 = Math.floor(sum / count);
    let aveH1 = Math.floor((maxH1 + minH1) / 2);

    sum = 0;
    count = 0;
    let minH2 = Infinity;
    let maxH2 = 0;
    start = Math.floor(this.W * 4 * this.H / 3);
    for (let i = start; i < start + this.step; i += 4) {
      const val = getValue(this.data, i);
      sum += val;
      count++;
      maxH2 = Math.max(maxH2, val);
      minH2 = Math.min(minH2, val);
    }
    let thH2 = Math.floor(sum / count);
    let aveH2 = Math.floor((maxH2 + minH2) / 2);


    sum = 0;
    count = 0;
    let minD1 = Infinity;
    let maxD1 = 0;
    let angle = Math.atan(this.H / this.W) * this.radians;
    let x = Math.floor(this.W / 2);
    let y = Math.floor(this.H / 2);
    let params = this.getIterationParams(angle, x, y);
    for (let p = 0; p < params.length; p++) {
      const i = params.getIndex(p, this.step);
      // toRed(this.data, i);
      const val = getValue(this.data, i);
      sum += val;
      count++;
      maxD1 = Math.max(maxD1, val);
      minD1 = Math.min(minD1, val);
    }
    let thD1 = Math.floor(sum / count);
    let aveD1 = Math.floor((maxD1 + minD1) / 2);
    // console.log('THRESHOLD D1', thD1, aveD1);

    sum = 0;
    count = 0;
    let minD2 = Infinity;
    let maxD2 = 0;
    params = this.getIterationParams(-angle, x, y);
    for (let p = 0; p < params.length; p++) {
      const i = params.getIndex(p, this.step);
      // toRed(this.data, i);
      const val = getValue(this.data, i);
      sum += val;
      count++;
      maxD2 = Math.max(maxD2, val);
      minD2 = Math.min(minD2, val);
    }
    let thD2 = Math.floor(sum / count);
    let aveD2 = Math.floor((maxD2 + minD2) / 2);
    // console.log('THRESHOLD D2', thD2, aveD2);

    const thAve = Math.floor((thV + thV1 + thV2 + thH + thH1 + thH2 + thD1 + thD2) / 8);
    // const thAve = Math.floor((thV + thH + thD1 + thD2) / 4);
    const minMaxAve = Math.floor((aveV + aveV1 + aveV2 + aveH + aveH1 + aveH2 + aveD1 + aveD2) / 8);
    // const minMaxAve = Math.floor((aveV + aveH + aveD1 + aveD2) / 4);
    const aveMin = Math.floor((minV + minV1 + minV2 + minH + minH1 + minH2 + minD1 + minD2) / 8);
    // const aveMin = Math.floor((minV + minH + minD1 + minD2) / 4);
    const aveMax = Math.floor((maxV + maxV1 + maxV1 + maxH + maxH1 + maxH2 + maxD1 + maxD2) / 8);
    // const aveMax = Math.floor((maxV + maxH + maxD1 + maxD2) / 4);

    const spread = aveMax - aveMin;
    const comp = Math.abs(thAve - minMaxAve);
    // const comp = thAve - minMaxAve;
    let final = thAve + comp;
    final = final > 230 ? 230 : final;

    console.log('THRESHOLD', thAve, minMaxAve, 'min', aveMin, 'max', aveMax, 'th', final);
    this.threshold = Math.max(thAve, minMaxAve);
    // this.threshold = thAve;
    // this.threshold = final;
  }

  rIterator(auto) {

    this.reloadImage();

    this.H = this.ctx.canvas.height;
    this.W = this.ctx.canvas.width;
    // this.inflection = Math.atan(this.H / this.W) * this.radians;
    // this.negInflection = this.inflection - 180;

    this.image = this.ctx.getImageData(0, 0, this.W, this.H);
    this.data = this.image.data;
    this.step = this.W * 4;

    if (auto) {
      this.findThreshold();
    }

/*
        /| ^ +
      /  |
    /    | opposite: tan(a) = oppposite / adjacent; a = tan-1(opp / adj)
  /a     |
/________| 0
adjacent

opposite = tan(a) * adjacent;
adjacent = width / 2;
opposite = tan(a) * width / 2

adjacent = opposite / tan(a)
opposite = height / 2
adjacent = tan(a) * height / 2

@ a = 0, H = 0, W = width
@ -inflection <= a <= +inflection: W = width, H = variable
@ +inflection - 180 <= a <= -inflection: H = height, W = variable

*/

    // console.log('height', this.H, 'width', this.W, 'w / 2', this.midW, 'h / 2', this.midH);

    const start = Date.now();

    const scans = [];
    // const ends = [];
    const paintLater = [];

    const gt = this.angleInput.from < this.angleInput.to && this.angleInput.step > 0;
    const lt = this.angleInput.from > this.angleInput.to && this.angleInput.step < 0;

    if (!gt && !lt) return;

    main:
    for (let a = this.angleInput.from; gt ? (a < this.angleInput.to ? true : false) : (a > this.angleInput.to ? true : false); a += this.angleInput.step) {
      const slice = {
        angle: a,
        center: this.center,
        found: [],
        hasStart: false,
        hasEnd: false,
        ends: [],
      };
      const tracker = {
        t: [],
        prev: null,
        expectedLength: 0,
      };

      const params = this.getIterationParams(a, this.center.x, this.center.y);

      for (let p = 0; p < params.length; p++) {
        const i = params.getIndex(p, this.step);

        if (p === 0) {
          tracker.prev = getAverage(this.data, i) < threshold ? 0 : 1;
          if (tracker.prev) {
            tracker.t[0] = {
              start: 0,
              current: true,
            };
          }
        }
        else {
          const marker = this.processPoint(slice, tracker, p, i);
          // placing findPerpendicular() here makes it 10 times slower for some reason
          // if (marker) {
          //   this.findPerpendicular(slice, params, marker);
          // }
        }
      }

      // this is here only to make it easier to see what was found prior to perpendiculars,
      // otherwise, sometimes can't see anything
      if (slice.found.length) {
        scans.push(slice);
      }

      const filtered = [];
      for (let marker of slice.found) {
        const perp = this.findPerpendicular(slice, params, marker);
        if (perp) {
          const res = this.processPerpendicular(perp, paintLater);
          if (res) {
            if (typeof res === 'string') {
              // console.log('---', res);
              break main;
            }
            filtered.push(marker);
          }
        }
      }

      if (filtered.length) {
        slice.found = filtered;
        scans.push(slice);
      }
    }

    const end = Date.now();
    console.log('time:', end - start);

    // purely for drawing lines on canvas
    const draw = true;
    if (draw) {
      for (let slice of scans) {
        this.drawSlice(slice);

        for (let { line, endLine, perp } of slice.ends) {

          const params = this.getIterationParams(line.angle, line.center.x, line.center.y);
          for (let p = Math.min(line.start, line.end); p < Math.max(line.start, line.end); p++) {
            const i = params.getIndex(p, this.step);
            paintLater.push(toYellow.bind(null, this.data, i))
          }

          const paramsEnd = this.getIterationParams(endLine.angle, endLine.center.x, endLine.center.y);
          for (let p = Math.min(endLine.start, endLine.end); p < Math.max(endLine.start, endLine.end); p++) {
            const i = paramsEnd.getIndex(p, this.step);
            paintLater.push(toPink.bind(null, this.data, i))
          }

          // if (perp.dir === 1) {
          //   for (let p = perp.start; p < perp.length; p++) {
          //     const i = perp.params.getIndex(p, this.step);
          //     paintLater.push(toBlue.bind(null, this.data, i))
          //   }
          // }
          // else {
          //   for (let p = 0; p <= perp.start; p++) {
          //     const i = perp.params.getIndex(p, this.step);
          //     paintLater.push(toYellow.bind(null, this.data, i))
          //   }
          // }
        }
      }

      for (let f of paintLater) {
        f();
      }
    }


    this.ctx.putImageData(this.image, 0, 0);
  }

  processPerpendicular(perpObj, paintLater) {
    // console.log('PROCESS PERPENDICULAR')



    const perp = perpObj.perp;
    const startMarker = this.findStartMarker(perp, paintLater);
    if (startMarker) {
      const markerLength = startMarker[1].length + startMarker[2].length + startMarker[3].length;
      const bars: any = this.findEndMarker(perp, startMarker[3].end, markerLength);

      if (perp.dir === 1) {
        for (let p = perp.start; p < perp.length; p++) {
          const i = perp.params.getIndex(p, this.step);
          paintLater.push(toBlue.bind(null, this.data, i))
        }
      }
      else {
        for (let p = perp.start; p >= 0; p--) {
          const i = perp.params.getIndex(p, this.step);
          paintLater.push(toYellow.bind(null, this.data, i))
        }
      }

      if (bars) {

        bars.totalLength = bars.reduce((acc, bar) => acc + bar.length, 0);
        this.bars = bars;
        const digits = this.decoder.decode(bars.slice(0, -4));
        if (digits) {
          console.log('');
          if (digits.valid) {
            console.log(digits.valid ? 'VALID' : 'INVALID', 'BARCODE', digits.type, digits.value);
          }
          else {
            console.error(digits.valid ? 'VALID' : 'INVALID', 'BARCODE', digits.type, digits.value);
          }
          console.log('');
          if (digits.valid) {
            return digits.value;
          }
        }

        const endP = bars[bars.length - 1].end;

        if (perp.dir === 1) {
          for (let p = perp.start; p < endP; p++) {
            const i = perp.params.getIndex(p, this.step);
            paintLater.push(toRed.bind(null, this.data, i))
          }
        }
        else {
          for (let p = perp.start; p > endP; p--) {
            const i = perp.params.getIndex(p, this.step);
            paintLater.push(toRed.bind(null, this.data, i))
          }
        }
        return true;
      }
    }
    return false;



    // if (perp.dir === 1) {
    //   for (let p = perp.start; p < perp.length; p++) {
    //     const i = perp.params.getIndex(p, this.step);
    //     paintLater.push(toBlue.bind(null, this.data, i))
    //   }
    // }
    // else {
    //   for (let p = 0; p <= perp.start; p++) {
    //     const i = perp.params.getIndex(p, this.step);
    //     paintLater.push(toYellow.bind(null, this.data, i))
    //   }
    // }
  }

  findEndMarker(perp, startP, markerLength) {
    const bars = [];

    let res: any = true;

    if (perp.dir === 1) {

      for (let p = startP; p < perp.length; p++) {
        const i = perp.params.getIndex(p, this.step);

        res = this.processEndMarkerPoint(p, i, startP, perp.length - 1, bars, markerLength);
        if (Array.isArray(res)) {
          return bars;
        }
      }
    }
    else {

      for (let p = startP; p >= 0; p--) {
        const i = perp.params.getIndex(p, this.step);

        res = this.processEndMarkerPoint(p, i, startP, 0, bars, markerLength);
        if (Array.isArray(res)) {
          return bars;
        }
      }
    }
  }

  processEndMarkerPoint(p, i, startP, endP, bars, markerLength) {
    const unit = Math.floor(markerLength / 3);
    const errCoeficient = this.errCoeficient;

    let val = getAverage(this.data, i);
    val = val < this.threshold ? 0 : 1;

    if (p === startP) {
      bars[0] = {
        val,
        start: p,
      };
      return;
    }
    const lastIndex = bars.length - 1;
    const lastBar = bars[lastIndex];
    const currVal = lastIndex % 2 === 0 ? 1 : 0; // even index is white (1)

    if (val === currVal && p !== endP) return;

    lastBar.end = p;
    lastBar.length = Math.abs(p - lastBar.start);

    // if we just closed white, check if end
    // 4 is the smallest possible combination
    if (bars.length > 4 && currVal === 1) {
      const marker = bars.slice(-4);

      if (withinError(marker[0].length) && withinError(marker[1].length) && withinError(marker[2].length)) {
        if (lastBar.length >= markerLength * 3 - getErr(markerLength * 3)) {
          lastBar.length = Math.min(lastBar.length, markerLength * 3);
          lastBar.end = lastBar.start + lastBar.length * (lastBar.end > lastBar.start ? 1 : -1);
          return bars;
        }
        // see if on the edge 2 marker length are enough to find end marker
        if (p === endP && lastBar.length >= markerLength * 2 - getErr(markerLength * 2)) {
          return bars;
        }
      }

    }

    if (p === endP) return;

    bars.push({
      val,
      start: p,
    });

    function withinError(length) {
      const err = getErr(unit);
      return length >= length - err && length <= length + err;
    }

    function getErr(expectedLength) {
      const max = 0.5;
      const min = 0.3;
      // need a finely controlled method here error to pixel dimension
      let comp = errCoeficient / Math.log(expectedLength); // loose
      // let comp = .5 / Math.log(expectedLength); // loose
      // let comp = 0.5 / Math.log(expectedLength); // tight
      comp = comp > max ? max : comp;
      comp = comp < min ? min : comp;

      const err = expectedLength * comp;
      // console.log('ERROR', expectedLength, Number(comp.toFixed(2)), Number(err.toFixed(2)));
      return err;
    }
  }

  findStartMarker(perp, paintLater) {
    const qzOffset = Math.floor(perp.qzLength / 3); // giving two marker length to confirm quiet zone (leftover after adjustment)
    // console.log(qzOffset);

    const tracker = {
      prev: null,
      expectedLength: null,
      qz: null,
      first: null,
      second: null,
      third: null,
    };

    let res: any = true;

    if (perp.dir === 1) {
      const start = perp.start;
      // const start = perp.start + qzOffset;

      for (let p = start; p < perp.length; p++) {
        const i = perp.params.getIndex(p, this.step);

        res = this.processStartMarkerPoint(p, i, start, tracker, qzOffset);
        if (res === false) {
          // console.log('FIND MARKER LOOP 1', false);
          return null;
        }

        if (res && typeof res === 'object') {
          // console.log('FIND MARKER LOOP 1', res);
          return [
            res.qz,
            res.first,
            res.second,
            res.third,
          ];
        }

        // paintLater.push(toBlue.bind(null, this.data, i))
      }
    }
    else {
      const start = perp.start;
      // const start = perp.start - qzOffset;

      for (let p = start; p >= 0; p--) {
      // for (let p = 0; p <= perp.start; p++) {
        const i = perp.params.getIndex(p, this.step);

        res = this.processStartMarkerPoint(p, i, start, tracker, qzOffset);
        if (res === false) {
          // console.log('FIND MARKER LOOP 1', false);
          return null;
        }

        if (res && typeof res === 'object') {
          // console.log('FIND MARKER LOOP 1', res);
          return [
            res.qz,
            res.first,
            res.second,
            res.third,
          ];
        }

        // paintLater.push(toYellow.bind(null, this.data, i))
      }
    }
    // just in case the loops end without return
    if (res && typeof res === 'object') {
      // console.log('FIND MARKER END', res);
      return [
        res.qz,
        res.first,
        res.second,
        res.third,
      ];
    }

    // if (res) {
    //   if (perp.dir === 1) {
    //     // const start = perp.start;
    //     const start = perp.start + qzOffset;

    //     for (let p = start; p < perp.length; p++) {
    //       const i = perp.params.getIndex(p, this.step);
    //       paintLater.push(toBlue.bind(null, this.data, i))
    //     }
    //   }
    //   else {
    //     const start = perp.start - qzOffset;

    //     for (let p = start; p >= 0; p--) {
    //       const i = perp.params.getIndex(p, this.step);
    //       paintLater.push(toYellow.bind(null, this.data, i))
    //     }
    //   }
    // }
  }

  processStartMarkerPoint(p, i, startP, tracker, expectedUnitLength) {
    // probably should do Math.floor(here)
    const unit = Math.ceil(expectedUnitLength / 3);
    const errCoeficient = this.errCoeficient;

    let val = getAverage(this.data, i);
    val = val < this.threshold ? 0 : 1;

    if (p === startP) {
      tracker.prev = val;
      tracker.qz = {
        start: p,
        current: true,
      };
      if (!val) {
        // console.log('PP START',  'val', val);
        return !!val;
      }
      return !!val;
    }

    if (tracker.qz.current) { // white, val === 1
      const qzLength = Math.abs(startP - p);
      if (val) {
        const l = qzLength < expectedUnitLength * 3;
        // console.log('PP QZ length', l);
        return l;
      }

      if (qzLength < expectedUnitLength * 2) {
        // console.log('PP QZ length is less than expected', qzLength, expectedUnitLength * 2, qzLength < expectedUnitLength * 2);
        return false;
      }

      tracker.prev = val;
      tracker.qz.current = false;
      tracker.qz.length = qzLength;
      // tracker.qz.length = Math.abs(p - tracker.qz.start);
      tracker.first = {
        start: p,
        current: true,
      };
      return true;
    }
    if (tracker.first.current) { // black, val === 0
      const length = Math.abs(p - tracker.first.start);
      if (!val) {
        // console.log('PP FIRST val', val, 'length', length, 'expected', unit - getErr(unit), length < unit + getErr(unit))
        return length < unit + getErr(unit);
      }

      if (length < unit - getErr(unit)) {
        // console.log('PP FIRST val', val, 'length', length, 'expected', unit - getErr(unit), length < unit - getErr(unit))
        return false;
      }

      tracker.expectedLength = length;
      tracker.prev = val;
      tracker.first.current = false;
      tracker.first.length = length;
      tracker.second = {
        start: p,
        current: true,
      };
      return true;
    }
    if (tracker.second.current) { // white, val === 1
      const length = Math.abs(p - tracker.second.start);
      if (val) return length < tracker.expectedLength + getErr(tracker.expectedLength);

      if (length < tracker.expectedLength - getErr(tracker.expectedLength)) return false;

      // tracker.expectedLength = length;
      tracker.prev = val;
      tracker.second.current = false;
      tracker.second.length = length;
      tracker.third = {
        start: p,
        current: true,
      };
      return true;
    }
    if (tracker.third.current) { // black, val === 0
      const length = Math.abs(p - tracker.third.start);
      if (!val) return length < tracker.expectedLength + getErr(tracker.expectedLength);

      if (length < tracker.expectedLength - getErr(tracker.expectedLength)) return false;

      // tracker.expectedLength = length;
      tracker.prev = val;
      tracker.third.current = false;
      tracker.third.length = length;
      tracker.third.end = p;
      return tracker;
    }


    return false;



    function getErr(expectedLength) {
      const max = 0.5;
      const min = 0.3;
      // need a finely controlled method here error to pixel dimension
      let comp = errCoeficient / Math.log(expectedLength); // loose
      // let comp = .5 / Math.log(expectedLength); // loose
      // let comp = 0.5 / Math.log(expectedLength); // tight
      comp = comp > max ? max : comp;
      comp = comp < min ? min : comp;

      const err = expectedLength * comp;
      // console.log('ERROR', expectedLength, Number(comp.toFixed(2)), Number(err.toFixed(2)));
      return err;
    }
  }

  findPerpendicular(slice, sliceParams, marker) {
    let perpendicular = null;
    // const sliceParams = this.getIterationParams(slice.angle, slice.center.x, slice.center.y);

    // for (let marker of slice.found) {

      let line1 = null;
      let line2 = null;

      let res1 = this.getEndLine(marker, 1, sliceParams);
      res1.sort((a, b) => b.length - a.length);
      if (res1.length) {
        const longest = res1[0];
        line1 = res1[0];
      }

      let res2 = this.getEndLine(marker, 3, sliceParams);
      res2.sort((a, b) => b.length - a.length);
      if (res2.length) {
        const longest = res2[0];
        line2 = res2[0];
      }

      if (line1 && line2) {

        const diff = Math.abs(line1.angle - line2.angle);

        if (diff < 1) {
          // There is a possiblility here that the estimated quiet zone start is off because of the direction flip
          // and instead of adding to outside line, quiet zone is added to inside line position. Not a big deal.
          const startLine = marker.type === 'start' ? line1 : line2;
          const endLine = marker.type === 'start' ? line2 : line1;
          const perp = this.getPerpendicularParams(startLine, slice, marker);

          perpendicular = {
            line: startLine,
            endLine,
            perp,
          };

          slice.ends.push(perpendicular);
        }
      }
    // }
    return perpendicular;
  }

  getPerpendicularParams(line, slice, marker) {
    // This is very confusing and I can't possibly prove this geometrically or explain it
    // The objective is simple: find where on the perpendicular is the start of the quiet zone,
    // and where to look for a barcode from this point: towards start or towards end.
    // It is possible that angles 0, 90, 180 would cause trouble. Not sure if it mill work for anything
    // other than the range between 0 - 180 with positive step.

    const sliceParams = this.getIterationParams(slice.angle, slice.center.x, slice.center.y);

    const perp = this.findPerpendicularAngle(line);
    const pParams = this.getIterationParams(perp.angle, perp.center.x, perp.center.y);
    const qzLength = this.findQuietZoneLength(slice.angle, perp.angle, marker[1].length + marker[2].length + marker[3].length);

    let res = {
      angle: perp.angle,
      center: perp.center,
      length: pParams.length,
      qzLength,
      params: pParams,
      start: 0,
      dir: 1,
    };

    if (sliceParams.dir === pParams.dir) {
      const sliceQzStartDir = marker.type === 'start' ? pParams.dir : -pParams.dir;
      const qzDir = sliceQzStartDir * pParams.dir;
      const qzStartPoint = pParams.center - qzLength * qzDir;

      if (sliceParams.dir === sliceQzStartDir) {
        res.start = qzStartPoint;
        res.dir = 1;
      }
      else {
        res.start = qzStartPoint;
        res.dir = -1;
      }
    }
    else {
      const sliceQzStartDir = marker.type === 'start' ? 1 : -1;
      const angleDiff = Math.abs(slice.angle - perp.angle);

      let qzDir;
      if (sliceParams.dir === -1) {
        qzDir = sliceQzStartDir * pParams.dir * (angleDiff < 90 ? 1 : -1);
      }
      else {
        qzDir = -sliceQzStartDir * pParams.dir * (angleDiff < 90 ? 1 : -1);

      }
      const qzStartPoint = pParams.center - qzLength * qzDir;

      if (qzDir === 1) {
        res.start = qzStartPoint;
        res.dir = 1;
      }
      else {
        res.start = qzStartPoint;
        res.dir = -1;
      }
    }
    return res;
  }

  findQuietZoneLength(sAngle, pAngle, sLength) {
    const markerLength = this.findMarkerLength(sAngle, pAngle, sLength);

    return Math.floor(markerLength * 3);
  }

  findMarkerLength(sAngle, pAngle, sLength) {
    let angle = Math.abs(sAngle - pAngle);
    // console.log('ANGLE CALCS', sAngle, pAngle, angle);
    // console.log('sLength', sLength);

    if (angle === 0 || angle === 180) return 0;
    if (angle === 90) return sLength;
    if (angle > 90) {
      angle = 180 - angle;
    }

    const length = sLength * Math.cos(angle / this.radians);
    // console.log('angle', angle, 'was', sLength, 'perp', length);
    return length;
  }

  findPerpendicularAngle(line) {
    const params1 = this.getIterationParams(line.angle, line.center.x, line.center.y);
    const mid1Point = Math.floor(line.start + (line.end - line.start) / 2); // negative sign should work itself out
    const { x: x1, y: y1 } = params1.getCoordinates(mid1Point);
    // console.log('x1', x1, 'y1', y1);

    let perpendicular1;
    if (line.angle < 0) {
      perpendicular1 = line.angle >= -90 ? line.angle - 90 : line.angle + 90;
    }
    else {
      perpendicular1 = line.angle < 90 ? line.angle + 90 : line.angle - 90;
    }
    // console.log('perpendicular1', Number(perpendicular1.toFixed(2)));
    // console.log('type:', line.type);
    const midParams1 = this.getIterationParams(perpendicular1, x1, y1);

    return {
      angle: perpendicular1,
      center: {
        x: x1,
        y: y1,
      },
    };
  }

  getEndLine(marker, i, sliceParams) {
    const center = marker[i].start + Math.floor(marker[i].length / 2);
    const x = sliceParams.getX(center);
    const y = sliceParams.getY(center);
    const res = [];

    for (let a = 0; a < 180; a += .3) {
      const params = this.getIterationParams(a, x, y);

      let start = null;
      let end = null;

      for (let p = params.center - 1; p > 0; p--) {
        const i = params.getIndex(p, this.step);
        let val = getAverage(this.data, i);
        val = val < this.threshold ? 0 : 1;

        if (val || !val && p === 1) {
          start = p;
          break;
        }
      }
      for (let p = params.center + 1; p < params.length; p++) {
        const i = params.getIndex(p, this.step);
        let val = getAverage(this.data, i);
        val = val < this.threshold ? 0 : 1;

        if (val || !val && p === params.length - 1) {
          end = p;
          break;
        }
      }

      if (start !== null && end !== null) {
        const length = Math.abs(end - start);

        if (length > marker[i].length * 10) {
          res.push({
            // dir: params.dir,
            type: marker.type,
            angle: a,
            start,
            end,
            length: Math.abs(end - start),
            center: {
              x,
              y,
            },
          });
        }

      }

      // Draw points
      // const pointLength = 3;
      // for (let p = Math.max(params.center - pointLength, 0); p < Math.min(params.center + pointLength, params.length); p++) {
      // // for (let p = 0; p < params.length; p++) {
      //   const i = params.getIndex(p, this.step);
      //   toYellow(this.data, i);
      // }
    }
    return res;
  }

  getAverage(arr, field) {
    let sum = 0;
    for (let f of arr) {
      sum += f[field];
    }
    return sum / arr.length;
  }

  drawSlice(slice) {
    const params = this.getIterationParams(slice.angle, slice.center.x, slice.center.y);

    let colorCount = 0;

    for (let marker of slice.found) {
      if (colorCount > 1) colorCount = 0;

      let start  = marker[1].start;
      if (marker[0].valid) {
        start = marker[0].start;
      }
      let end = marker[3].start + marker[3].length;
      if (marker[4]) {
        end = marker[4].start + marker[4].length;
      }
      // const length = end - start;
      // const percent = 0.1;
      // const head = length * percent < 3 ? 3 : Math.floor(length * percent);

      for (let p = start; p < end; p++) {
        const i = params.getIndex(p, this.step);
        if (slice.hasStart && slice.hasEnd) {
          toDarkGreen(this.data, i);
          // toYellow(this.data, i);
          // toGreen(this.data, i);
        }
        else if (marker.type === 'end') {
          toRed(this.data, i);
        }
        else {
          toBlue(this.data, i);
          // toGreen(this.data, i);
        }

        // if (p - start <= head) {
        //   toGreen(this.data, i);
        // }
        // else {
        //   toRed(this.data, i);
        // }

        // if (colorCount === 0) {
        //   // toGreen(this.data, i);
        //   toRed(this.data, i);
        // }
        // else {
        //   toRed(this.data, i);
        // }
      }
      colorCount++;
    }
  }

  processPoint(slice, tracker, p, i) {
    const quietZoneMultiplier = 3;

    let val = getAverage(this.data, i);
    val = val < this.threshold ? 0 : 1;

    const errCoeficient = this.errCoeficient;

    function getErr(expectedLength) {
      const max = 0.5;
      const min = 0.3;
      // need a finely controlled method here error to pixel dimension
      let comp = errCoeficient / Math.log(expectedLength); // loose
      // let comp = .5 / Math.log(expectedLength); // loose
      // let comp = 0.5 / Math.log(expectedLength); // tight
      comp = comp > max ? max : comp;
      comp = comp < min ? min : comp;

      const err = expectedLength * comp;
      // console.log('ERROR', expectedLength, Number(comp.toFixed(2)), Number(err.toFixed(2)));
      return err;
    }

    if (!tracker.t[0]) {
      if (!tracker.prev && val) {
        tracker.t[0] = {
          start: p,
          current: true,
        };
      }
      tracker.prev = val;
      return;
    }

    if (tracker.t[0] && tracker.t[0].current) { // white
      if (val) return;

      tracker.t[0].length = p - tracker.t[0].start;
      tracker.t[0].current = false;
      tracker.t[1] = {
        start: p,
        current: true,
      };
      tracker.prev = val;
      return;
    }
    if (tracker.t[1] && tracker.t[1].current) { // balck
      if (!val) return;

      tracker.t[1].current = false;
      tracker.t[1].length = p - tracker.t[1].start;
      tracker.expectedLength = tracker.t[1].length;
      tracker.t[2] = {
        start: p,
        current: true,
      };
      tracker.prev = val;
      return;
    }
    if (tracker.t[2] && tracker.t[2].current) { // white space
      if (val) return;

      tracker.t[2].current = false;
      tracker.t[2].length = p - tracker.t[2].start;
      const diff = Math.abs(tracker.expectedLength - tracker.t[2].length);
      const maxErr = getErr(tracker.expectedLength);

      if (diff > maxErr) {
        tracker.t = [
          tracker.t[2],
          {
            start: p,
            current: true,
          },
        ];
        tracker.expectedLength = null;
        tracker.prev = val;
        return;
      }

      // expectedLength = (tracker.t[2].length + tracker.t[1].length) / 2;
      tracker.t[2].current = false;
      tracker.t[3] = {
        start: p,
        current: true,
      };
      tracker.prev = val;
      return;
    }
    if (tracker.t[3] && tracker.t[3].current) { // black
      if (!val) return;

      tracker.t[3].current = false;
      tracker.t[3].length = p - tracker.t[3].start;
      const diff = Math.abs(tracker.expectedLength - tracker.t[3].length);
      const maxErr = getErr(tracker.expectedLength);

      if (diff > maxErr) {
        tracker.expectedLength = tracker.t[3].length;
        tracker.t = [
          tracker.t[2],
          tracker.t[3],
          {
            start: p,
            current: true,
          },
        ];
        tracker.prev = val;
        return;
      }
      const expectedQuietZone = (tracker.t[1].length + tracker.t[2].length + tracker.t[3].length) * quietZoneMultiplier;
      const quietZoneErr = getErr(expectedQuietZone);
      const quietZoneDiff = Math.abs(tracker.t[0].length - expectedQuietZone);
      // console.log('--GOT 3', t)
      // console.log('expected', expectedQuietZone)
      // console.log('err', quietZoneErr)
      // console.log('diff', quietZoneDiff)

      if (tracker.t[0].length < (expectedQuietZone - quietZoneErr)) {
        tracker.t[0].valid = false;
        tracker.t[4] = {
          start: p,
          current: true,
        };
        tracker.prev = val;
        return;
      }
      tracker.t[0].valid = true;
      const qzLength = expectedQuietZone > tracker.t[0].length ? tracker.t[0].length : Math.floor(expectedQuietZone);
      tracker.t[0].start = tracker.t[0].start + tracker.t[0].length - Math.floor(expectedQuietZone);

      slice.found.push(tracker.t);
      tracker.t.type = 'start';
      slice.hasStart = true;
      tracker.prev = val;

      tracker.t = [{
        start: p,
        current: true,
      }];
      tracker.expectedLength = null;
      tracker.prev = val;

      return slice.found[slice.found.length - 1];
    }
    if (tracker.t[4] && tracker.t[4].current) { // white
      // if (val) return; // need to check every single pixel or it will run off the screen

      const expectedQuietZone = (tracker.t[1].length + tracker.t[2].length + tracker.t[3].length) * quietZoneMultiplier;
      const quietZoneErr = getErr(expectedQuietZone);
      const quietZoneDiff = Math.abs(tracker.t[4].length - expectedQuietZone);

      if (val) {
        const length = p - tracker.t[4].start;

        if (length >= (expectedQuietZone - quietZoneErr)) {
          tracker.t[4].current = false;
          tracker.t[4].length = length;

          // Object.defineProperty('type', tracker.t, {value: 'end'});
          tracker.t.type = 'end';

          slice.found.push(tracker.t);
          slice.hasEnd = true;

          tracker.t = [
            tracker.t[4],
            {
              start: p,
              current: true,
            },
          ];
          tracker.expectedLength = null;
          tracker.prev = val;
        }
        return slice.found[slice.found.length - 1];
      }



      tracker.t[4].current = false;
      tracker.t[4].length = p - tracker.t[4].start;


      if (tracker.t[4].length < (expectedQuietZone - quietZoneErr)) {
        tracker.expectedLength = null;
        tracker.t = [
          tracker.t[4],
          {
            start: p,
            current: true,
          },
        ];
        tracker.prev = val;
        return;
      }
      tracker.t.type = 'end';
      slice.found.push(tracker.t);
      slice.hasEnd = true;

      tracker.t = [
        tracker.t[4],
        {
          start: p,
          current: true,
        },
      ];
      tracker.expectedLength = null;
      tracker.prev = val;

      return slice.found[slice.found.length - 1];
    }
  }

  getIterationParams(angle, cX, cY) {
    cX = cX > this.W ? this.W : cX;
    cX = cX < 0 ? 0 : cX;
    cX = Math.floor(cX);
    cY = cY > this.H ? this.H : cY;
    cY = cY < 0 ? 0 : cY;
    cY = Math.floor(cY);

    const limits = this.getLimits(angle, cX, cY);

    const x0 = cX - limits.x.start;
    const y0 = cY - limits.y.start;
    const xEnd = cX + limits.x.end;
    const yEnd = cY + limits.y.end;

    const xDir = x0 <= cX ? 1 : -1;
    // xDir = x0 === 0 && cX === 0 ? 1 : xDir;
    // xDir = x0 === cX && cX === this.W ? -1 : xDir;
    const yDir = y0 <= cY ? 1 : -1;


    const xLength = Math.abs(xEnd - x0);
    const yLength = Math.abs(yEnd - y0);

    const xStep = xLength / yLength;
    const yStep = yLength / xLength;

    const x = {
      start: x0,
      end: xEnd,
      dir: xDir,
      length: xLength,
      step: xStep,
    };
    const y = {
      start: y0,
      end: yEnd,
      dir: yDir,
      length: yLength,
      step: yStep,
    };
    const p = {
      x,
      y,
      length: null,
      getX: null,
      getY: null,
      center: null,
      dir: null,
      type: null,
      getIndex(p, step) {
        const x = this.getX(p);
        const y = this.getY(p);
        const X = x * 4;
        const Y = y * step;
        return X + Y;
      },
      getCoordinates(p) {
        return {
          x: this.getX(p),
          y: this.getY(p),
        }
      },
    };

    if (x.length >= y.length) {
      p.length = x.length;
      p.center = Math.abs(limits.x.start);
      p.dir = x.dir;
      p.type = 'X';
      p.getX = function(p) {
        const res =  this.x.start + p * this.x.dir;
        // if (isNaN(res)) {
        //   console.log('this.x.start', this.x.start, 'p', p, 'this.x.dir', this.x.dir);
        // }
        return res;
      };
      p.getY = function(p) {
        const res =  Math.floor(this.y.start + p * this.y.step * this.y.dir);
        return res;
      };
    }
    else {
      p.length = y.length;
      p.center = Math.abs(limits.y.start);
      p.dir = y.dir;
      p.type = 'Y';
      p.getX = function(p) {
        const res = Math.floor(this.x.start + p * this.x.step * this.x.dir);
        return res;
      };
      p.getY = function(p) {
        const res =  this.y.start + p * this.y.dir;
        return res;
      };
    }

    return p;
  }

  getLimits(angle, cX, cY) {
/*
        /| ^ +
      /  |
    /    | opposite: tan(a) = oppposite / adjacent; a = tan-1(opp / adj)
  /a     |           tan(a) = H / W
/________| 0         W = H / tan(a)
adjacent             H = tan(a) * W
                     a = atan(H / W)

        90 →
  ↑ q1  |  q2
  0 ----o---- -180 : origin of arrow marks inclusive
    q4  |  q3   ↓
      ← -90

*/
    // console.log('- - - -')
    // console.log('W  ', this.W, 'H  ', this.H);
    // console.log('W/2', this.midW, 'H/2', this.midH);
    // console.log('angle:', angle);
    // console.log('inflection', this.inflection);
    angle = angle % 360;
    const sign = angle >= 0 ? 1 : -1;
    if (Math.abs(angle) > 180) {
      angle = angle - 360 * sign;
    }
    angle = angle === 180 ? -180 : angle;


    let q1, q2, q3, q4 = null;

    if (cX > 0 && cY > 0) {
      q1 = {
        width: cX,
        height: cY,
        inflection: Math.atan(cY / cX) * this.radians,
        dir: 1,
        dirX: 1,
        dirY: 1,
      }
    }
    if (cX < this.W && cY > 0) {
      q2 = {
        width: this.W - cX,
        height: cY,
        inflection: Math.atan(cY / (this.W - cX)) * this.radians,
        dir: 1,
        dirX: -1,
        dirY: 1,
      }
    }
    if (cX < this.W && cY < this.H) {
      q3 = {
        width: this.W - cX,
        height: this.H - cY,
        inflection: Math.atan((this.H - cY) / (this.W - cX)) * this.radians,
        dir: 1,
        dirX: -1,
        dirY: -1,
      }
    }
    if (cX > 0 && cY < this.H) {
      q4 = {
        width: cX,
        height: this.H - cY,
        inflection: Math.atan((this.H - cY) / cX) * this.radians,
        dir: 1,
        dirX: 1,
        dirY: -1,
      }
    }

    let startQ;
    let qLimits;

    if (0 <= angle && angle < 90) {
      startQ = 1;

      if (q1) {
        q1.dirX = 1;
        q1.dirY = 1;
      }
      if (q3) {
        q3.dirX = 1;
        q3.dirY = 1;
      }
      qLimits = this.getQLimits(q1, q3, angle);
    }
    else if (90 <= angle && angle < 180) {
      startQ = 2

      if (q2) {
        q2.dirX = -1;
        q2.dirY = 1;
      }
      if (q4) {
        q4.dirX = -1;
        q4.dirY = 1;
      }
      qLimits = this.getQLimits(q2, q4, 180 - angle);
    }
    else if (-180 <= angle && angle < -90) {
      startQ = 3

      if (q3) {
        q3.dirX = -1;
        q3.dirY = -1;
      }
      if (q1) {
        q1.dirX = -1;
        q1.dirY = -1;
      }
      qLimits = this.getQLimits(q3, q1, angle + 180);
    }
    else if (-90 <= angle && angle < 0) {
      startQ = 4

      if (q4) {
        q4.dirX = 1;
        q4.dirY = -1;
      }
      if (q2) {
        q2.dirX = 1;
        q2.dirY = -1;
      }
      qLimits = this.getQLimits(q4, q2, -angle);
    }
    else {
      throw 'Should not be here. Invalid angle: ' + angle;
    }

    // console.log('Q', startQ, 'angle:', angle, qLimits);

    return qLimits;
  }

  getQLimits(startQ, endQ, angle) {
    let startX = 0, startY = 0, endX = 0, endY = 0;

    if (startQ) {
      if (angle < startQ.inflection) {
        startX = startQ.width;
        startY = Math.floor(Math.tan(angle / this.radians) * startQ.width);
      }
      else {
        startX = Math.floor(startQ.height / Math.tan(angle / this.radians));
        startY = startQ.height;
      }
      startX *= startQ.dirX;
      startY *= startQ.dirY;
    }
    if (endQ) {
      if (angle < endQ.inflection) {
        endX = endQ.width;
        endY = Math.floor(Math.tan(angle / this.radians) * endQ.width);
      }
      else {
        endX = Math.floor(endQ.height / Math.tan(angle / this.radians));
        endY = endQ.height;
      }
      endX *= endQ.dirX;
      endY *= endQ.dirY;
    }

    return {
      x: {
        start: startX,
        end: endX,
      },
      y: {
        start: startY,
        end: endY,
      },
      angle,
    };
  }

  reloadImage() {
    this.ctx.drawImage(this.originalImage, 0, 0);
  }

  load() {
    let loaded: any = localStorage.getItem('image');
    if (!loaded) return;
    loaded = JSON.parse(loaded);

    // let loaded = test_image1;

    this.ctx.canvas.width = loaded.width;
    this.ctx.canvas.height = loaded.height;

    this.H = loaded.height;
    this.W = loaded.width;
    this.midW = Math.floor(loaded.width / 2);
    this.midH = Math.floor(loaded.height / 2);
    this.center = {
      x: this.midW,
      y: this.midH,
     };
    this.radius = Math.min(this.midW, this.midH);
    // const image = this.ctx.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    const image = new ImageData(loaded.width, loaded.height);
    const data = image.data;

    for (let i = 0, r = 0; i < data.length; i += 4, r++) {
      data[i] = loaded.data[r];
      data[i + 1] = loaded.data[r];
      data[i + 2] = loaded.data[r];
      data[i + 3] = 255;
    }
    createImageBitmap(image).then((data) => {
      this.originalImage = data;
    });

    this.ctx.putImageData(image, 0, 0);
  }

  save() {
    const image = this.ctx.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    const step = image.width * 4;
    const data = image.data;

    const res = {
      width: this.ctx.canvas.width,
      height: this.ctx.canvas.height,
      data: [],
    };

    let count = 0;

    for (let i = 0; i < data.length; i += 4) {
      let val = toGray(data, i);
      if (val === 0 && data[i + 3] === 0) {
        val = 255;
        if (count < 10) {
          console.log(i);
        }
        count++;
      }
      res.data.push(val);
    }
    localStorage.setItem('image', JSON.stringify(res));
  }

  log(value) {
    // console.log('...', value);
    const prev = this.sliderValue;
    this.sliderValue = value;


    this.angle = value - prev;
    this.rotate(false);
    this.findOrientation();
  }

  loadFile(files) {
    if (files.length === 0)
      return;

    var mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.message = "Only images are supported.";
      return;
    }

    const image = new Image();
    image.onload = () => {

      this.midW = Math.floor(image.width / 2);
      this.midH = Math.floor(image.height / 2);
      this.center = {
        x: this.midW,
        y: this.midH,
       };
      this.radius = Math.min(this.midW, this.midH);


      this.ctx.canvas.width = image.width;
      this.ctx.canvas.height = image.height;
      this.ctx.drawImage(image, 0, 0);
      this.ctx.save();

      // this.drawCircle();

      this.sliderValue = 0;
      this.angle = 10;
    }
    this.originalImage = image;
    image.src = URL.createObjectURL(files[0]);
  }

  takeSlice() {
    const start = new Date();

    const image = this.ctx.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    const step = image.width * 4;
    const data = image.data;

    const slice = [];

    for (let i = this.midW * 4; i < data.length; i += step) {
      let val = getValue(data, i);
      val = val > threshold ? 255 : 0;
      val = val.toString(16).padStart(2, '0');
      slice.push({
        color: '#' + getColor(i) + getColor(i + 1) + getColor(i + 2),
        gray: '#' + val + val + val,
        o: getValue(data, i),
      });
    }
    this.slice = slice;
    const res = this.processSlice(slice);

    console.log(res);

    let colorCount = 0;
    for (let s of res) {
      if (colorCount > 1) colorCount = 0;
      let start  = s[1].start;
      if (s[0].valid) {
        start = s[0].start;
      }
      let end = s[3].start + s[3].length;
      if (s[4]) {
        end = s[4].start + s[4].length;
      }
      for (let i = this.midW * 4 + step * start; i < this.midW * 4 + step * end; i += step) {
        if (colorCount === 0) {
          toGreen(data, i);
        }
        else {
          toRed(data, i);
        }
      }
      colorCount++;
    }
    this.ctx.putImageData(image, 0, 0);

    function getColor(i) {
      return data[i].toString(16).padStart(2, '0');
    }
    function getGray(i) {
      return
    }
    const end = new Date();
    console.log('time:', end - start);
  }

  processSlice(slice) {
    const th = threshold;
    const err = 0.3;
    let res = [];
    let group = null;
    let first = null;
    let count = 0;
    let prev = slice[0].o < th ? 0 : 1;
    let next = 0;
    let expectedLength = 0;

    function getErr(expectedLength) {
      const max = 0.5;
      const min = 0.1;
      let comp = 2 / Math.log(2 + expectedLength);
      comp = comp > max ? max : comp;
      comp = comp < min ? min : comp;

      const err = expectedLength * comp;
      return err;
    }

    let t = [];
    if (prev) {
      t[0] = {
        start: 0,
        current: true,
      };
    }

    for (let p = 1; p < slice.length; p++) {
      const val = slice[p].o < th ? 0 : 1;

      if (!t[0]) {
        if (!prev && val) {
          t[0] = {
            start: p,
            current: true,
          };
        }
        prev = val;
        continue;
      }

      if (t[0] && t[0].current) { // white
        if (val) continue;

        t[0].length = p - t[0].start;
        t[0].current = false;
        t[1] = {
          start: p,
          current: true,
        };
        prev = val;
        continue;
      }
      if (t[1] && t[1].current) { // balck
        if (!val) continue;

        t[1].current = false;
        t[1].length = p - t[1].start;
        expectedLength = t[1].length;
        t[2] = {
          start: p,
          current: true,
        };
        prev = val;
        continue;
      }
      if (t[2] && t[2].current) { // white space
        if (val) continue;

        t[2].current = false;
        t[2].length = p - t[2].start;
        const diff = Math.abs(expectedLength - t[2].length);
        const maxErr = getErr(expectedLength);

        if (diff > maxErr) {
          t = [
            t[2],
            {
              start: p,
              current: true,
            },
          ];
          expectedLength = null;
          prev = val;
          continue;
        }

        // expectedLength = (t[2].length + t[1].length) / 2;
        t[2].current = false;
        t[3] = {
          start: p,
          current: true,
        };
        prev = val;
        continue;
      }
      if (t[3] && t[3].current) { // black
        if (!val) continue;

        t[3].current = false;
        t[3].length = p - t[3].start;
        const diff = Math.abs(expectedLength - t[3].length);
        const maxErr = getErr(expectedLength);

        if (diff > maxErr) {
          expectedLength = t[3].length;
          t = [
            t[2],
            t[3],
            {
              start: p,
              current: true,
            },
          ];
          prev = val;
          continue;
        }
        const expectedQuietZone = (t[1].length + t[2].length + t[3].length) * 3;
        const quietZoneErr = getErr(expectedQuietZone);
        const quietZoneDiff = Math.abs(t[0].length - expectedQuietZone);
        // console.log('--GOT 3', t)
        // console.log('expected', expectedQuietZone)
        // console.log('err', quietZoneErr)
        // console.log('diff', quietZoneDiff)

        if (t[0].length < (expectedQuietZone - quietZoneErr)) {
          t[0].valid = false;
          t[4] = {
            start: p,
            current: true,
          };
          prev = val;
          continue;
        }
        t[0].valid = true;
        res.push(t);
        prev = val;

        t = [{
          start: p,
          current: true,
        }];
        expectedLength = null;
        prev = val;

        continue;
      }
      if (t[4] && t[4].current) { // white
        if (val) continue;

        t[4].current = false;
        t[4].length = p - t[4].start;

        const expectedQuietZone = (t[1].length + t[2].length + t[3].length) * 3;
        const quietZoneErr = getErr(expectedQuietZone);
        const quietZoneDiff = Math.abs(t[4].length - expectedQuietZone);

        if (t[4].length < (expectedQuietZone - quietZoneErr)) {
          expectedLength = null;
          t = [
            t[4],
            {
              start: p,
              current: true,
            },
          ];
          prev = val;
          continue;
        }

        res.push(t);

        t = [
          t[4],
          {
            start: p,
            current: true,
          },
        ];
        expectedLength = null;
        prev = val;

        continue;
      }

    }
    return res;
  }

  drawCircle() {
    const image = this.originalImage;

    this.ctx.beginPath();
    this.ctx.arc(this.midW, this.midH, this.radius, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  rotate(process?) {
    if (!this.angle) return;
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    const midW = this.ctx.canvas.width / 2;
    const midH = this.ctx.canvas.height / 2;

    this.ctx.translate(midW, midH);
    const angle = this.angle * Math.PI / 180;
    this.ctx.rotate(angle);
    this.ctx.translate(-midW, -midH);
    this.ctx.drawImage(this.originalImage, 0, 0);

    // this.drawCircle();
    this.takeSlice();
    this.drawCircle();

    if (process) {
      this.process();
    }
  }

  rotateVirtual(increment) {
    this.vctx.clearRect(0, 0, this.vctx.canvas.width, this.vctx.canvas.height);

    const midW = this.vctx.canvas.width / 2;
    const midH = this.vctx.canvas.height / 2;

    this.vctx.translate(midW, midH);
    const angle = increment * Math.PI / 180;
    this.vctx.rotate(angle);
    this.vctx.translate(-midW, -midH);
    this.vctx.drawImage(this.ctx.canvas, 0, 0);

    // this.drawCircle();

    // this.process();
  }

  findOrientation() {
    let printed = false;
    let Yprinted = false;
    const start: any = new Date();

    this.vctx.canvas.width = this.ctx.canvas.width;
    this.vctx.canvas.height = this.ctx.canvas.height;
    this.vctx.drawImage(this.ctx.canvas, 0, 0);

    const yStep = Math.ceil(this.radius * 2 / 200);
    let res = [];
    let aPrev = 0;
    let step;
    // for (let a = 0; a < 360; a += 8.5) {
    for (let a = 0; a < 180; a += 3.9) {
      const startAngle: any = new Date();
      // console.log('processing angle', a);
      // const startRotate: any = new Date();
      if (a) {
        this.rotateVirtual(a - aPrev);
        aPrev = a;
      }
      // const endRotate: any = new Date();
      const image = this.vctx.getImageData(0, 0, this.vctx.canvas.width, this.vctx.canvas.height);
      // console.log('ROTATE TIME', endRotate - startRotate);

      const data = image.data;
      step = image.width * 4;

      const lines = [];
      const rows = Array(image.height).fill(0);

      const samplePercent = .5;
      // const imageMin = this.midW - Math.floor(this.radius * samplePercent);
      // const imageMax = this.midW + Math.floor(this.radius * samplePercent);
      const imageMin = this.midW - this.radius;
      const imageMax = this.midW + this.radius;

      // const skipLines = 1;
      // console.log(imageMax - imageMin);
      // const skipLines = Math.ceil(imageMax - imageMin / skipLinesConst);
      const skipLines = Math.ceil(this.radius * 2 / skipLinesConst);
      // if (!printed) {
      //   console.log('skipLines', skipLines);
      //   printed = true;
      // }

      for (let x = imageMin; x < imageMax; x += skipLines) {
        const lineIndex = x * 4;
        const line = [];
        let min = Infinity;
        let max = 0;
        let y = 0;

        const xDiff = this.midW - x;
        const xDiff2 = Math.pow(xDiff, 2);
        const thDim = Math.floor(Math.min(image.height, image.width) * 0.01);
        let thVal = 10;
        // const thVal = Math.floor((max - min) * 0.5);

        let prevVal = null;
        let prevIndex = 0;
        let start = 0;
        const edges = [];
        let curr = null;
        let currStart = null;
        let currEnd = null;

        // const yStep = 2;
        // if (!Yprinted) {
        //   console.log('Y step', yStep);
        //   Yprinted = true;
        // }
        const yCompStep = step * yStep;

        for (let d = lineIndex; d < data.length; d += yCompStep, y += yStep) {
          const yDiff = this.midH - y;
          const radiusDiff = Math.sqrt(xDiff2 + Math.pow(yDiff, 2));
          if (radiusDiff > this.radius) {
            continue;
          }

          const value = getValue(data, d);
          if (prevVal === null) {
            prevVal = value;
          }

          const maxV = Math.max(prevVal, value);
          const minV = Math.min(prevVal, value);
          const changePercent = 100 - 100 * minV / maxV;
          if (changePercent > 50) {
            if (!currStart) {
              currStart = y;
              prevVal = value;
            }
            else {
              currEnd = y;
              if (currEnd - currStart >= thDim) {
                rows[currStart]++;
                rows[currEnd]++;
              }
              currStart = y;
              currEnd = null;
              prevVal = value;
            }
          }
        }
      } // columns loop

      let rMin = Infinity;
      let rMax = 0;
      let rSum = 0;
      let rCount = 0;
      let rAve = 0;

      for (let r of rows) {
        if (r) {
          rMin = Math.min(rMin, r);
          rMax = Math.max(rMax, r);
          rSum += r;
          rCount++;
        }
      }
      rAve = rCount ? rSum / rCount : 0;
      let ratio = rAve ? rCount / rAve : Infinity;

      res.push({
        count: rCount,
        ave: rAve,
        ratio,
        // angle: a + this.sliderValue,
        angle: a,
        rows: rows,
      });

      const endAngle: any = new Date();
      // console.log('Angle time', endAngle - startAngle);

    } // angle loop


    // console.log(res);
    let min = Infinity;
    let minObj = res[0];
    let minObjIndex = 0;

    // for (let r of res) {
    for (let i = 0; i < res.length; i++) {
      let r = res[i];
      // if (minObj) {
        if (r.ratio < minObj.ratio) {
          min = r.ratio;
          minObj = r;
          minObjIndex = i;
        }
      // }
    }
    // console.log('min angle object', minObj);

    // let angle = minObj.angle;
    let angle = minObj.angle + this.sliderValue;

    const radians = angle * Math.PI / 180;

    const x = this.radius * Math.cos(radians);
    const y = this.radius * Math.sin(radians);

    this.ctx.beginPath();
    this.ctx.lineWidth = 5;
    this.ctx.strokeStyle = 'red';
    this.ctx.moveTo(this.midW - x, this.midH + y);
    this.ctx.lineTo(this.midW + x, this.midH - y);
    this.ctx.stroke();


    const end: any = new Date();
    console.log('AUTO TIME', end - start);


    let rMin = Infinity;
    let rMax = 0;
    let rSum = 0;
    let rCount = 0;
    let rAve = 0;

    for (let r of minObj.rows) {
      if (r) {
        rMin = Math.min(rMin, r);
        rMax = Math.max(rMax, r);
        rSum += r;
        rCount++;
      }
    }
    this.endsCount = rCount;

    const occurances = {};
    for (let r of minObj.rows) {
      if (!r) continue;
      if (!(r in occurances)) {
        occurances[r] = 0;
      }
      occurances[r]++;
    }
    const occArr = Object.keys(occurances).map((key) => ({key: key, val: occurances[key]}));
    occArr.sort((a, b) => {
      return b.val - a.val;
    });
    // console.log('occurances', occArr);
    // console.log('occurances[0]', occArr[0]);

    rAve = rSum / rCount;
    this.rAve = rAve;
    // console.log('rMin', rMin, 'rMax', rMax, 'rAve', rAve);
    // console.log(rows);


    let maxOcc = Number(occArr[0].key);
    let maxOccVal = occArr[0].val;

    this.maxOcc = maxOcc;
    this.maxOccVal = 0;

    for (let r of occArr) {
      if (Number(r.key) < rAve) {
        this.maxOccVal += Number(r.val);
        // break;
      }
    }

    this.ctx2.canvas.width = this.ctx.canvas.width;
    this.ctx2.canvas.height = this.ctx.canvas.height;
    const midW = this.ctx2.canvas.width / 2;
    const midH = this.ctx2.canvas.height / 2;

    this.ctx2.translate(midW, midH);
    this.ctx2.rotate((minObj.angle) * Math.PI / 180);
    this.ctx2.translate(-midW, -midH);
    this.ctx2.drawImage(this.ctx.canvas, 0, 0);

    // const image = this.originalImage;
    let image = this.ctx2.getImageData(0, 0, this.ctx2.canvas.width, this.ctx2.canvas.height);
    // let image = this.ctx.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    const data = image.data;

    for (let r = 0; r < minObj.rows.length; r += 1) {
      const rowValue = minObj.rows[r];
      let val = getValueH(data, r, step);
      const comp = (rMax - rMin) * 0.0;

      if (rowValue > rMin + comp && rowValue >= rAve) {
        val = ((rowValue - rMin) / (rMax - rMin)) * 255;
        val = Math.floor(val);
        drawLineH(data, r, step, val);

      }
    }

    let target = minObj.angle + 90;
    res = [...res.slice(minObjIndex), ...res.slice(0, minObjIndex)];
    let prev = null;
    let perpendicular = null;

    for (let i = res.length - minObjIndex; i < res.length; i++) {
      let r = res[i];
      r.angle += 180;
    }



    for (let val of res) {
      if (prev) {
        if (val.angle > target) {
          perpendicular = val.ratio < prev.ratio ? val : prev;
          break;
        }
        prev = val;
      }
      else {
        if (val.angle < target) {
          prev = val;
        }
      }
    }

    for (let r of perpendicular.rows) {
      if (r) {
        rMin = Math.min(rMin, r);
        rMax = Math.max(rMax, r);
        rSum += r;
        rCount++;
      }
    }
    rAve = rSum / rCount;
    // console.log('perpendicular AVE', rAve);
    // console.log('perpendicular', perpendicular);

    const offset = this.midW - this.radius;

    for (let i = offset; i < this.ctx.canvas.width; i++) {
      let val = perpendicular.rows[i - offset];
      if (val > rMin && val >= rAve) {
        val = ((val - rMin) / (rMax - rMin)) * 255;
        val = Math.floor(val);
        drawLineV(data, i, step, val);

      }
    }

    // this.ctx2.clearRect(0, 0, this.ctx2.canvas.width, this.ctx2.canvas.height);
    this.ctx2.putImageData(image, 0, 0);
    // this.ctx2.drawImage(this.ctx.canvas, 0, 0);

    this.ctx2.beginPath();
    this.ctx2.arc(this.midW, this.midH, this.radius, 0, 2 * Math.PI);
    this.ctx2.stroke();

    // this.vctx.restore();
    // this.vctx.drawImage(this.ctx2.canvas, 0, 0);


    // image = this.ctx2.getImageData(0, 0, this.ctx2.canvas.width, this.ctx2.canvas.height);
    // this.ctx.restore();
    // // this.ctx2.translate(midW, midH);
    // // this.ctx2.rotate(90 * Math.PI / 180);
    // // // this.ctx2.rotate((flipAngle) * Math.PI / 180);
    // // this.ctx2.translate(-midW, -midH);
    // this.ctx2.putImageData(image, 0, 0);
    // // this.ctx2.drawImage(this.ctx2.canvas, 0, 0);
    // // this.ctx2.drawImage(this.vctx.canvas, 0, 0);
  }

  _findOrientation() {
    const start: any = new Date();
    // this.ctx.drawImage(this.originalImage, 0, 0);
    // var oimage = this.ctx.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.vctx.canvas.width = this.ctx.canvas.width;
    this.vctx.canvas.height = this.ctx.canvas.height;
    this.vctx.drawImage(this.ctx.canvas, 0, 0);
    // this.ctx2.drawImage(this.ctx.canvas, 0, 0);
    // this.vctx.putImageData(oimage, 0, 0);
    // this.vctx.save();

    let res = [];
    let aPrev = 0;
    for (let a = 0; a < 180; a++) {
      // console.log('processing angle', a);
      if (a) {
        this.rotateVirtual(a - aPrev);
        aPrev = a;
      }

      var image = this.vctx.getImageData(0, 0, this.vctx.canvas.width, this.vctx.canvas.height);
      const data = image.data;
      const step = image.width * 4;

      const lines = [];

      for (let i = 0; i < image.width; i += 2) {
        const line = processLine(image, i * 4, this.midW, this.midH, this.radius);
        if (line.edges.length) {
          lines.push(line);

        }

      }

      const rows = Array(image.height).fill(0);

      for (let line of lines) {
        for (let edge of line.edges) {
          rows[edge.start]++;
          rows[edge.end]++;
        }
      }

      let rMin = Infinity;
      let rMax = 0;
      let rSum = 0;
      let rCount = 0;
      let rAve = 0;

      for (let r of rows) {
        if (r) {
          rMin = Math.min(rMin, r);
          rMax = Math.max(rMax, r);
          rSum += r;
          rCount++;
        }
      }
      rAve = rCount ? rSum / rCount : 0;
      let ratio = rAve ? rCount / rAve : Infinity;

      res.push({
        count: rCount,
        ave: rAve,
        ratio,
        angle: a,
      });

    }
    // console.log(res);
    let min = Infinity;
    let minObj = res[0];

    for (let r of res) {
      // if (minObj) {
        if (r.ratio < minObj.ratio) {
          min = r.ratio;
          minObj = r;
        }
      // }
    }
    console.log('min angle object', minObj);

    let angle = minObj.angle + this.sliderValue;
    // angle = angle > 90 ? angle - 90 : angle;

    const radians = angle * Math.PI / 180;
    console.log('Angle', angle, 'Radians', radians)

    // const halfH = Math.ceil(this.radius * Math.tan(radians));

    const x = this.radius * Math.cos(radians);
    const y = this.radius * Math.sin(radians);
    console.log('X', x, 'Y', y);
    console.log('start', this.midW - x, this.midH + y)
    console.log('end', this.midW + x, this.midH - y)

    // this.ctx.restore();
    // this.ctx.drawImage(this.originalImage, 0, 0);

    this.ctx.beginPath();
    this.ctx.moveTo(this.midW - x, this.midH + y);
    this.ctx.lineTo(this.midW + x, this.midH - y);
    this.ctx.stroke();




    const end: any = new Date();
    console.log('AUTO TIME', end - start);
  }

  process() {
    // console.log('processing . . .');
    var image = this.ctx.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    // console.log('width', image.width, 'height', image.height);

    // const center = getCenter(image);

    const data = image.data;

    // const colorMap = [toRed, toGreen, toBlue];

    // console.log('data.length', data.length, center.width, center.width * 4)
    const step = image.width * 4;

    // const line = [];
    // let min = Infinity;
    // let max = 0;
    // const lineIndex = center.width * 4;

    // const oneStep = 4 * 5;

    const lines = [];

    // for (let i = lineIndex; i < lineIndex + oneStep * 5 + 1; i += oneStep) {
    const skipLines = Math.ceil(this.radius * 2 / skipLinesConst);

    for (let i = 0; i < image.width; i += skipLines) {
      const line = processLine(image, i * 4, this.midW, this.midH, this.radius);
      if (line.edges.length) {
        lines.push(line);

      }

    }

    for (let line of lines) {
      colorLine(data, line, step);
    }

    // console.log('lines:', lines);

    const rows = Array(image.height).fill(0);

    for (let line of lines) {
      for (let edge of line.edges) {
        // if (!rows[edge.start]) {
        //   rows[edge.start] = 0;
        // }
        // if (!rows[edge.end]) {
        //   rows[edge.end] = 0;
        // }
        rows[edge.start]++;
        rows[edge.end]++;
      }
    }

    let rMin = Infinity;
    let rMax = 0;
    let rSum = 0;
    let rCount = 0;
    let rAve = 0;

    for (let r of rows) {
      if (r) {
        rMin = Math.min(rMin, r);
        rMax = Math.max(rMax, r);
        rSum += r;
        rCount++;
      }
    }
    this.endsCount = rCount;

    const occurances = {};
    for (let r of rows) {
      if (!r) continue;
      if (!(r in occurances)) {
        occurances[r] = 0;
      }
      occurances[r]++;
    }
    const occArr = Object.keys(occurances).map((key) => ({key: key, val: occurances[key]}));
    occArr.sort((a, b) => {
      return b.val - a.val;
    });
    console.log('occurances', occArr);
    // console.log('occurances[0]', occArr[0]);

    rAve = rSum / rCount;
    this.rAve = rAve;
    console.log('rMin', rMin, 'rMax', rMax, 'rAve', rAve);
    // console.log(rows);


    let maxOcc = Number(occArr[0].key);
    let maxOccVal = occArr[0].val;

    this.maxOcc = maxOcc;
    this.maxOccVal = 0;
    // this.maxOccVal = maxOccVal;

    for (let r of occArr) {
      if (Number(r.key) < rAve) {
        this.maxOccVal += Number(r.val);
        // break;
      }
    }

    for (let r = 0; r < rows.length; r += 1) {
      const rowValue = rows[r];
      let val = getValueH(data, r, step);
      const comp = (rMax - rMin) * 0.0;
      // if (rowValue > rMin + comp) {
      if (rowValue > rMin + comp && rowValue >= rAve) {
      // if (rowValue > rMin + comp && rowValue >= maxOcc) {
        // console.log(rowValue, maxOcc, rowValue >= maxOcc * 0.001)
        val = ((rowValue - rMin) / (rMax - rMin)) * 255;
        val = Math.floor(val);
        // console.log(val);
        drawLineH(data, r, step, val);

      }

    }

    this.ctx2.canvas.width = image.width;
    this.ctx2.canvas.height = image.height;
    this.ctx2.putImageData(image, 0, 0);
  }
}

function getValueH(data, index, step) {
  const i = index * step;
  return getValue(data, i);
}

function drawLineV(data, index, step, val?) {

  for (let i = index * 4; i < data.length; i += step) {
    if (val !== undefined) {
      data[i] = val;
      data[i + 1] = 0;
      data[i + 2] = val;
    }
    else {
      toRed(data, i);
    }
  }
}

function drawLineH(data, index, step, val?) {

  for (let i = index * step; i < (index * step + step); i += 4) {
    // toRed(data, i);
    if (val !== undefined) {
      data[i] = val;
      data[i + 1] = 0;
      data[i + 2] = val;
      // if (val > 127) {
      //   data[i] = val;
      //   data[i + 1] = 0;
      //   data[i + 2] = val;
      // }
      // else {
      //   data[i] = val;
      //   data[i + 1] = val;
      //   data[i + 2] = val;
      // }
    }
    else {
      toRed(data, i);
    }
  }
}

function processLine(image, lineIndex, midW, midH, radius) {
  // const center = getCenter(image);

  const data = image.data;

  const colorMap = [toRed, toGreen, toBlue];

  // console.log('data.length', data.length, center.width, center.width * 4)
  const step = image.width * 4;

  const line = [];
  let min = Infinity;
  let max = 0;
  // const lineIndex = center.width * 4;

  for (let i = lineIndex; i < data.length; i += step) {
    // let y = Math.floor(i / step);
    // let x = (i % step) / 4;

    // const xDiff = midW - x;
    // const yDiff = midH - y;
    // const d = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
    // if (d >= radius) {
    //   // console.log('x', x, 'y', y);
    //   continue;
    // }


    // toBlack(data, i);
    // toGray(data, i);
    // toBlue(data, i);
    // toGreen(data, i);
    // toRed(data, i);
    const value = getValue(data, i);
    min = Math.min(min, value);
    max = Math.max(max, value);

    line.push(value);
  }

  // console.log(line);
  // console.log('lineIndex', lineIndex, 'min', min, 'max', max);

  const edges = findEdges(line, min, max, Math.min(image.height, image.width), lineIndex, midW, midH, radius, step);

  // console.log(edges);
  // let count = 0;
  // for (let e of edges) {
  //   let convert = colorMap[count];


  //   for (let i = lineIndex + step * e.start; i < (lineIndex + step * e.end); i += step) {
  //     convert(data, i);
  //   }
  //   count++;
  //   if (count === colorMap.length) {
  //     count = 0;
  //   }
  // }

  return {
    index: lineIndex,
    line: line,
    edges: edges,
  };
}

function getAverageEdge(edges, type) {
  let sum = 0;

  for (let e of edges) {
    sum += type === 'start' ? e.start : e.end;
  }

  return Math.floor(sum / edges.length);
}

function filterEdges(width, edges, allowance, type) {
  const res = [];

  let group = [];
  let startI;

  for (let i1 = 0; i1 < edges.length; i1++) {

    const e1 = edges[i1];
    if (!group.length) {
      group.push(e1);
      startI = type === 'start' ? e1.start : e1.end;
    }

    for (let i2 = i1 + 1; i2 < edges.length; i2++) {

      const e2 = edges[i2];
      const diff = Math.abs(startI - (type === 'start' ? e2.start : e2.end));
      const distance = Math.abs(group[0].index - e2.index);
      const maxHeightDiff = Math.ceil(distance * Math.tan(.5 * Math.PI / 180));
      if (diff < maxHeightDiff) {
        group.push(e2);
      }
      else {
        // res.push(group);
        // group = [];
        // break;
      }
    }
    res.push(group);
    group = [];
  }

  res.sort((a, b) => {
    return b.length - a.length;
  });

  return res;
}

function getSortedEdges(lines) {
  const edges = [];
  let start;
  let end;

  for (let line of lines) {
    for (let edge of line.edges) {
      edges.push(edge);
    }
  }

  start = edges.slice().sort((a, b) => {
    return a.start - b.start;
    // return b.start - a.start;
  });

  end = edges.slice().sort((a, b) => {
    return a.end - b.end;
    // return b.end - a.end;
  })

  return {
    start,
    end,
  };
}

function colorEdges(data, edges, step) {
  const colorMap = [toRed, toGreen, toBlue];
  let count = 0;
  for (let e of edges) {
    let convert = colorMap[count];


    for (let i = e.index + step * e.start; i < (e.index + step * e.end); i += step) {
      convert(data, i);
    }
    count++;
    if (count === colorMap.length) {
      count = 0;
    }
  }
}

function colorLine(data, line, step) {
  const colorMap = [toRed, toGreen, toBlue];
  let count = 0;
  for (let e of line.edges) {
    let convert = colorMap[count];


    for (let i = line.index + step * e.start; i < (line.index + step * e.end); i += step) {
      convert(data, i);
    }
    count++;
    if (count === colorMap.length) {
      count = 0;
    }
  }
}

function findEdges(line, min, max, refDim, lineIndex, midW, midH, radius, step) {
  const thDim = Math.floor(refDim * 0.1);
  const thVal = Math.floor((max - min) * 0.5);
  // console.log('threshold', thVal);
  // let prevVal = line[0];
  let prevVal = null;
  let prevIndex = 0;
  let start = 0;
  const edges = [];
  let curr = null;

  let logCount = 0;

  for (let p = 1; p < line.length; p++) {

    let y = p;
    // let y = Math.floor(lineIndex / step);
    let x = (lineIndex % step) / 4;

    const xDiff = midW - x;
    const yDiff = midH - y;
    const d = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
    if (d > radius) {
      // console.log('x', x, 'y', y);
      continue;
    }
    else {
      if (prevVal === null) {
        prevVal = line[p];
      }
    }

    const value = line[p];
    const diff = Math.abs(prevVal - value);
    if (diff > thVal) {
      // console.log(diff);
      if (!curr) {
        curr = {
          index: lineIndex,
          start: p,
        };
        prevVal = value;
      }
      else {
        curr.end = p;
        if (curr.end - curr.start >= thDim) {
          edges.push(curr);
        }
        curr = {
          index: lineIndex,
          start: p,
        };
        prevVal = value;
      }
    }
  }
  return edges;
}

function getAverage(data, i) {
  return Math.floor((data[i] + data[i + 1] + data[i + 2]) / 3);
}

function getValue(data, i) {
  let val =  Math.floor((data[i] + data[i + 1] + data[i + 2]) / 3);
  // don't know why this would happen
  return !isNaN(val) ? val : 0;
}

function getCenter(image) {
  return {
    width: Math.floor(image.width / 2),
    height: Math.floor(image.height / 2),
  }
}

function toBlue(data, i) {
  data[i] = 0;
  data[i + 1] = 0;
  data[i + 2] = 255;
}

function toRed(data, i) {
  data[i] = 255;
  data[i + 1] = 0;
  data[i + 2] = 0;
}

function toGreen(data, i) {
  data[i] = 0;
  data[i + 1] = 255;
  data[i + 2] = 0;
}

function toDarkGreen(data, i) {
  data[i] = 0;
  data[i + 1] = 190;
  data[i + 2] = 0;
}

function toBlack(data, i) {
  data[i] = 0;
  data[i + 1] = 0;
  data[i + 2] = 0;
}

function toGray(data, i) {
  var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
  data[i] = avg; // red
  data[i + 1] = avg; // green
  data[i + 2] = avg; // blue
  return Math.floor(avg);
}

function toYellow(data, i) {
  data[i] = 255;
  data[i + 1] = 187;
  data[i + 2] = 0;
}

function toPink(data, i) {
  data[i] = 255;
  data[i + 1] = 0;
  data[i + 2] = 230;
}
