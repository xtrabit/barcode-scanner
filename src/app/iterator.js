

class Iterator {

  constructor(width, height) {
    this.W = width;
    this.H = height;
    this.step = width * 4;
    this.radians = 180 / Math.PI;
  }

  getIterationParams(angle, centerX, centerY) {
    const edgeLimit = 0;

    centerX = centerX >= this.W ? this.W - edgeLimit : centerX;
    centerX = centerX <= 0 ? edgeLimit : centerX;
    centerX = Math.floor(centerX);
    centerY = centerY >= this.H ? this.H - edgeLimit : centerY;
    centerY = centerY <= 0 ? edgeLimit : centerY;
    centerY = Math.floor(centerY);

    const limits = this.getLimits(angle, centerX, centerY);

    const x0 = centerX - limits.x.start;
    const y0 = centerY - limits.y.start;
    const xEnd = centerX + limits.x.end;
    const yEnd = centerY + limits.y.end;

    // Additional check is needed when X diff is too small to determine direction close to edges.
    // Not sure why Y works on the edges without the additional check.
    let xDir;
    if (x0 !== centerX) {
      xDir = x0 < centerX ? 1 : -1;
    }
    else {
      xDir = xEnd >= centerX ? 1 : -1
    }
    const yDir = y0 <= centerY ? 1 : -1;


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
    const params = {
      angle,
      x,
      y,
      length: null,
      getX: null,
      getY: null,
      center: null,
      dir: null,
      type: null,
      _step: this.step,
      getIndex(p) {
        const x = this.getX(p);
        const y = this.getY(p);
        const X = x * 4;
        const Y = y * this._step;
        return X + Y;
      },
      getCoordinates(p) {
        return {
          x: this.getX(p),
          y: this.getY(p),
        };
      },
    };

    if (x.length >= y.length) {
      params.length = x.length;
      params.center = Math.abs(limits.x.start);
      params.dir = x.dir;
      params.type = 'X';
      params.getX = function(p) {
        return this.x.start + p * this.x.dir;
      };
      params.getY = function(p) {
        return Math.floor(this.y.start + p * this.y.step * this.y.dir);
      };
    }
    else {
      params.length = y.length;
      params.center = Math.abs(limits.y.start);
      params.dir = y.dir;
      params.type = 'Y';
      params.getX = function(p) {
        return Math.floor(this.x.start + p * this.x.step * this.x.dir);
      };
      params.getY = function(p) {
        return this.y.start + p * this.y.dir;
      };
    }
    // console.log(params);
    return params;
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
      qLimits = this.getLimitsFromQuarters(q1, q3, angle);
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
      qLimits = this.getLimitsFromQuarters(q2, q4, 180 - angle);
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
      qLimits = this.getLimitsFromQuarters(q3, q1, angle + 180);
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
      qLimits = this.getLimitsFromQuarters(q4, q2, -angle);
    }
    else {
      throw 'Should not be here. Invalid angle: ' + angle;
    }

    // console.log('Q', startQ, 'angle:', angle, qLimits);

    return qLimits;
  }

  getLimitsFromQuarters(startQ, endQ, angle) {
    let startX = 0, startY = 0, endX = 0, endY = 0;

    if (startQ) {
      if (angle < startQ.inflection) {
        startX = startQ.width;
        startY = Math.round(Math.tan(angle / this.radians) * startQ.width);
        // console.log('1 startX', startX);
        // console.log('1 startY', startY);
        startY = startY > startQ.height ? startQ.height : startY;
        startY = startY < 0 ? 0 : startY;
        // startY = Math.floor(Math.tan(angle / this.radians) * startQ.width);
      }
      else {
        startX = Math.round(startQ.height / Math.tan(angle / this.radians));
        // console.log('2 startX', startX);
        // console.log('2 startY', startY);
        startX = startX > startQ.width ? startQ.width : startX;
        startX = startX < 0 ? 0 : startX;
        // startX = Math.floor(startQ.height / Math.tan(angle / this.radians));
        startY = startQ.height;
      }
      startX *= startQ.dirX;
      startY *= startQ.dirY;
    }
    if (endQ) {
      if (angle < endQ.inflection) {
        endX = endQ.width;
        endY = Math.round(Math.tan(angle / this.radians) * endQ.width);
        // console.log('1 endX', endX);
        // console.log('1 endY', endY);
        endY = endY > endQ.height ? endQ.height : endY;
        endY = endY < 0 ? 0 : endY;
        // endY = Math.floor(Math.tan(angle / this.radians) * endQ.width);
      }
      else {
        endX = Math.round(endQ.height / Math.tan(angle / this.radians));
        // console.log('2 endX', endX);
        // console.log('2 endY', endY);
        endX = endX > endQ.width ? endQ.width : endX;
        endX = endX < 0 ? 0 : endX;
        // endX = Math.floor(endQ.height / Math.tan(angle / this.radians));
        endY = endQ.height;
      }
      endX *= endQ.dirX;
      endY *= endQ.dirY;
    }
    // console.log(angle);
    // console.log('X', startX, endX);
    // console.log('Y', startY, endY);

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
}

module.exports = Iterator;
