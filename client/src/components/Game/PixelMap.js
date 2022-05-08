const pixels = require("image-pixels");

export default class PixelMap {
  constructor(src) {
    this.status = -1;
    this.src = src;
  }

  //Methods
  async drawDataToCanvas(data, width, height, dx, dy) {
    const imgData = await new ImageData(data, width, height);
    document.body
      .appendChild(document.getElementById("testCanvas"))
      .getContext("2d")
      .putImageData(imgData, dx, dy);
  }

  async aquireData() {
    const { data, width, height } = await pixels(this.src);

    this.data = data;
    this.width = width;
    this.height = height;
    this.status = 0;
  }

  async buildMap(key, verbose) {
    const totalIndx = this.width * this.height;
    let pxArray = new Uint8ClampedArray(totalIndx);
    for (let i = 0; i < totalIndx; i++) {
      if (verbose && i && ((i / totalIndx) * 100) % 10 === 0) {
        console.log(`${(i / totalIndx) * 100}% Complete`);
      }
      const color = this.getPixelrgbString(i);
      if (key[color]) {
        pxArray[i] = key[color];
      } else {
        pxArray[i] = 0;
      }
    }
    this.map = pxArray;
    this.status = 1;

    verbose && console.log("100% Complete");
  }

  getPixelrgbString(index) {
    const i = index * 4;
    return `${this.data[i]}${this.data[i + 1]}${this.data[i + 2]}`; // [RGB]
  }

  getDataPixel(index) {
    const i = index * 4,
      d = this.data;
    return [d[i], d[i + 1], d[i + 2], d[i + 3]]; // [R,G,B,A]
  }

  getDataPixelXY(x, y) {
    const idx = parseInt(y * this.width + x);
    return this.getDataPixel(idx);
  }

  getMapPixel(index) {
    return this.map[index];
  }

  getMapPixelXY(x, y) {
    const idx = parseInt(y * this.width + x);
    return this.getMapPixel(idx);
  }

  getSubData(x1, y1, x2, y2) {
    let [x, xMax] =
      x1 < x2 ? [parseInt(x1), parseInt(x2)] : [parseInt(x2), parseInt(x1)];
    let [y, yMax] =
      y1 < y2 ? [parseInt(y1), parseInt(y2)] : [parseInt(y2), parseInt(y1)];

    let subArray = new Uint8ClampedArray((xMax - x) * (yMax - y) * 4);
    let subIndex = 0;
    for (let i = 0; i < yMax - y; i++) {
      for (let j = 0; j < xMax - x; j++) {
        [
          subArray[subIndex],
          subArray[subIndex + 1],
          subArray[subIndex + 2],
          subArray[subIndex + 3],
        ] = this.getDataPixelXY(x + j, y + i);

        subIndex += 4;
      }
    }
    return subArray;
  }

  getSubMap(x1, y1, x2, y2) {
    let [x, xMax] =
      x1 < x2 ? [parseInt(x1), parseInt(x2)] : [parseInt(x2), parseInt(x1)];
    let [y, yMax] =
      y1 < y2 ? [parseInt(y1), parseInt(y2)] : [parseInt(y2), parseInt(y1)];

    let subArray = new Uint8ClampedArray((xMax - x) * (yMax - y));
    let subIndex = 0;
    for (let i = 0; i < yMax - y; i++) {
      for (let j = 0; j < xMax - x; j++) {
        subArray[subIndex] = this.getMapPixelXY(x + j, y + i);
        subIndex++;
      }
    }
    return subArray;
  }
}
