import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';

let skipLinesConst = 20;

const threshold = 150;

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

  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvas2') canvas2: ElementRef<HTMLCanvasElement>;
  ctx: CanvasRenderingContext2D;
  ctx2: CanvasRenderingContext2D;
  vctx: CanvasRenderingContext2D;
  vcanvas;

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
      this.radius = Math.min(this.midW, this.midH);


      this.ctx.canvas.width = image.width;
      this.ctx.canvas.height = image.height;
      this.ctx.drawImage(image, 0, 0);
      this.ctx.save();

      // this.drawCircle();

      this.sliderValue = 0;
      this.angle = 10;

      // const midW = Math.floor(image.width / 2);
      // const midH = Math.floor(image.height / 2);
      // const dim = Math.min(midW, midH);

      // this.ctx.beginPath();
      // this.ctx.arc(midW, midH, dim, 0, 2 * Math.PI);
      // this.ctx.stroke();
    }
    this.originalImage = image;
    // this.originalImage = URL.createObjectURL(files[0]);
    // image.src = this.originalImage;
    image.src = URL.createObjectURL(files[0]);

    // const midW = Math.floor(image.width / 2);
    // const midH = Math.floor(image.height / 2);
    // const dim = Math.min(midW, midH);

    // this.ctx.beginPath();
    // this.ctx.arc(midW, midH, 50, 0, 2 * Math.PI);
    // this.ctx.stroke();
  }

  takeSlice() {
    const start = new Date();
    // for (let t = 0; t < 180; t += 4) {

    const image = this.ctx.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    const step = image.width * 4;
    const data = image.data;

    const slice = [];

    for (let i = this.midW * 4; i < data.length; i += step) {
      // let val = getValue(data, i).toString(16).padStart(2, '0');
      let val = getValue(data, i);
      val = val > threshold ? 255 : 0;
      val = val.toString(16).padStart(2, '0');
      // slice.push(val);
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
      const start  = s[0].start;
      const end = s[2].start + s[2].length;
      // console.log('start', start, 'end', end);
      for (let i = this.midW * 4 + step * start; i < this.midW * 4 + step * end; i += step) {
        // console.log(data[i]);
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
  // } //
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

    function getErr() {
      const max = 0.5;
      const min = 0.1;
      // let comp = 1 / expectedLength * 1.5;
      let comp = 0.75 / Math.log(2 + expectedLength);
      comp = comp > max ? max : comp;
      comp = comp < min ? min : comp;

      const err = expectedLength * comp;
      // console.log('ERROR', expectedLength, Number(comp.toFixed(2)), Number(err.toFixed(2)));
      return err;
    }

    let t = [];

    for (let p = 1; p < slice.length; p++) {
      const val = slice[p].o < th ? 0 : 1;

      if (!t[0]) {
        if (prev && !val) {
          t[0] = {
            start: p,
            current: true,
          };
        }
        prev = val;
        continue;
      }
      if (t[0] && t[0].current) {
        if (prev === val) {
          continue;
        }
        else {
          t[0].length = p - t[0].start;
          expectedLength = t[0].length;
          t[0].current = false;
          t[1] = {
            start: p,
            current: true,
          };
          prev = val;
          continue;
        }
      }
      if (t[1] && t[1].current) {
        if (prev === val) {
          continue;
        }
        else {
          t[1].length = p - t[1].start;
          const diff = Math.abs(expectedLength - t[1].length);
          const maxErr = getErr();
          // const maxErr = 1 / expectedLength;
          // const maxErr = expectedLength * err;

          if (diff > maxErr) {
            // console.log('diff over', diff, maxErr)
          // if (diff > expectedLength + maxErr || diff < expectedLength - maxErr) {
            t = [];
            t[0] = {
              start: p,
              current: true,
            };
            expectedLength = null;
            prev = val;
            continue;
          }

          expectedLength = (t[1].length + t[0].length) / 2;
          t[1].current = false;
          t[2] = {
            start: p,
            current: true,
          };
          prev = val;
          continue;
        }
      }
      if (t[2] && t[2].current) {
        if (prev === val) {
          continue;
        }
        else {
          t[2].length = p - t[2].start;
          const diff = Math.abs(expectedLength - t[2].length);
          const maxErr = getErr();
          // const maxErr = 1 / expectedLength;
          // const maxErr = expectedLength * err;

          if (diff > maxErr) {
            const newStart = {
              start: t[2].start,
              current: false,
              length: t[2].length,
            };
            expectedLength = t[2].length;
            t = [newStart];
            t[1] = {
              start: p,
              current: true,
            };
            prev = val;
            continue;
          }

          res.push(t);
          // expectedLength = null;
          prev = val;
          const newStart = {
            start: t[2].start,
            current: false,
            length: t[2].length,
          };
          expectedLength = t[2].length;
          t = [newStart];
          t[1] = {
            start: p,
            current: true,
          };
          // t = [];
          continue;
        }
      }

    }
    return res;
  }

  drawCircle() {
    const image = this.originalImage;

    // const midW = Math.floor(image.width / 2);
    // const midH = Math.floor(image.height / 2);
    // const dim = Math.min(midW, midH);

    this.ctx.beginPath();
    this.ctx.arc(this.midW, this.midH, this.radius, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  rotate(process?) {
    // console.log('angle', this.angle)
    if (!this.angle) return;
    // var image = this.ctx.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    const midW = this.ctx.canvas.width / 2;
    const midH = this.ctx.canvas.height / 2;

    this.ctx.translate(midW, midH);
    const angle = this.angle * Math.PI / 180;
    // console.log('midH', midH, 'midW', midW, 'angle', angle);
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
    // this.ctx.drawImage(this.originalImage, 0, 0);
    // var oimage = this.ctx.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.vctx.canvas.width = this.ctx.canvas.width;
    this.vctx.canvas.height = this.ctx.canvas.height;
    this.vctx.drawImage(this.ctx.canvas, 0, 0);
    // this.ctx2.drawImage(this.ctx.canvas, 0, 0);
    // this.vctx.putImageData(oimage, 0, 0);
    // this.vctx.save();

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
        // const thVal = 10;
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
        // for (let d = lineIndex; d < data.length; d += step * yStep, y += yStep) {
          // if (prevVal) {
          //   const valueP10 = value - value * 0.1;
          //   const valueN10 = value + value * 0.1;

          // }
          // min = Math.min(min, value);
          // max = Math.max(max, value);

          // line.push(value);
          const yDiff = this.midH - y;
          const radiusDiff = Math.sqrt(xDiff2 + Math.pow(yDiff, 2));
          if (radiusDiff > this.radius) {
            // console.log('x', x, 'y', y);
            continue;
          }


          const value = getValue(data, d);
          if (prevVal === null) {
            prevVal = value;
            // prevVal = line[p];
          }

          // const diff = Math.abs(prevVal - value);
          const maxV = Math.max(prevVal, value);
          const minV = Math.min(prevVal, value);
          const changePercent = 100 - 100 * minV / maxV;
          if (changePercent > 50) {
            // const yDiff = this.midH - y;
            // const radiusDiff = Math.sqrt(xDiff2 + Math.pow(yDiff, 2));
            // if (radiusDiff > this.radius) {
            //   // console.log('x', x, 'y', y);
            //   continue;
            // }
          // if (diff > thVal) {
            // console.log(diff);

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
    // angle = angle > 90 ? angle - 90 : angle;

    const radians = angle * Math.PI / 180;
    // console.log('Angle', angle, 'Radians', radians)

    // const halfH = Math.ceil(this.radius * Math.tan(radians));

    const x = this.radius * Math.cos(radians);
    const y = this.radius * Math.sin(radians);
    // console.log('X', x, 'Y', y);
    // console.log('start', this.midW - x, this.midH + y)
    // console.log('end', this.midW + x, this.midH - y)

    // this.ctx.restore();
    // this.ctx.drawImage(this.originalImage, 0, 0);

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
    // this.maxOccVal = maxOccVal;

    for (let r of occArr) {
      if (Number(r.key) < rAve) {
        this.maxOccVal += Number(r.val);
        // break;
      }
    }











    // this.ctx2.restore();
    this.ctx2.canvas.width = this.ctx.canvas.width;
    this.ctx2.canvas.height = this.ctx.canvas.height;
    const midW = this.ctx2.canvas.width / 2;
    const midH = this.ctx2.canvas.height / 2;

    this.ctx2.translate(midW, midH);
    // console.log(minObj.angle)
    // const flipAngle = minObj.angle === 0 ? 0 : minObj.angle - 180;
    // const flipAngle = minObj.angle === 0 ? 180 : minObj.angle;
    this.ctx2.rotate((minObj.angle) * Math.PI / 180);
    // this.ctx2.rotate((flipAngle) * Math.PI / 180);
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


    // let target = minObj.angle > 90 ? minObj.angle - 90 : minObj.angle + 90;
    let target = minObj.angle + 90;
    res = [...res.slice(minObjIndex), ...res.slice(0, minObjIndex)];
    let prev = null;
    let perpendicular = null;

    for (let i = res.length - minObjIndex; i < res.length; i++) {
      let r = res[i];
      // console.log('angle before', r.angle);
      r.angle += 180;
      // console.log('after', r.angle);
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

    // maxOcc *= 0.1;
    // maxOcc /= 2;
    // console.log('Max occ', maxOcc);

    // this.endsCount = 0;
    // for (let r of rows) {
    //   if (r >= rAve) {
    //     this.endsCount++;
    //   }
    // }

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









    // const degrees = 1;
    // const allowance = Math.ceil(image.width * Math.tan(degrees * Math.PI / 180));
    // console.log('allowance', allowance);

    // const sorted = getSortedEdges(lines);

    // // console.log(sorted);

    // // colorEdges(data, sorted.start, step);

    // const filteredStart = filterEdges(image.width, sorted.start, allowance, 'start');

    // console.log('filteredStart', filteredStart);

    // const selectIndex = 0;

    // const aveStartStart = getAverageEdge(filteredStart[selectIndex], 'start');
    // const aveStartEnd = getAverageEdge(filteredStart[selectIndex], 'end');
    // const midStart = Math.floor((aveStartStart + aveStartEnd) / 2);

    // console.log('ave start:', aveStartStart, aveStartEnd, midStart);

    // drawLineH(data, midStart, step);

    // colorEdges(data, filteredStart[selectIndex], step);






    // const filteredEnd = filterEdges(image.width, sorted.end, allowance, 'end');

    // // console.log(filteredEnd);
    // const aveEndStart = getAverageEdge(filteredEnd[0], 'start');
    // const aveEndEnd = getAverageEdge(filteredEnd[0], 'end');
    // const midEnd = Math.floor((aveEndStart + aveEndEnd) / 2);

    // console.log('ave end:', aveEndStart, aveEndEnd, midEnd);

    // drawLineH(data, midEnd, step);

    // colorEdges(data, filteredEnd[0], step);






    // for (let i = lineIndex; i < data.length; i += step) {
    //   // toBlack(data, i);
    //   // toGray(data, i);
    //   // toBlue(data, i);
    //   // toGreen(data, i);
    //   // toRed(data, i);
    //   const value = getValue(data, i);
    //   min = Math.min(min, value);
    //   max = Math.max(max, value);

    //   line.push(value);
    // }

    // // console.log(line);
    // console.log('min', min, 'max', max);

    // const edges = findEdges(line, min, max, image.width);

    // console.log(edges);
    // let count = 0;
    // for (let e of edges) {
    //   let convert = colorMap[count];


    //   for (let i = lineIndex + step * e.start; i < (lineIndex + step * e.end); i += step) {
    //     // toRed(data, i);
    //     convert(data, i);
    //   }
    //   count++;
    //   if (count === colorMap.length) {
    //     count = 0;
    //   }
    // }

    // for (var i = 0; i < data.length; i += 4) {
    //   toGray(data, i);
    // }



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

function getValue(data, i) {
  return Math.floor((data[i] + data[i + 1] + data[i + 2]) / 3);
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
}
