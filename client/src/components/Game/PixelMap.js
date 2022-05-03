export default class PixelMap {
  constructor(image, width, height) {
    this.width = width;
    this.height = height;

    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvasContext = this.canvas.getContext("2d");
    this.canvasContext.drawImage(image, 0, 0, width, height);
    this.map = this.canvasContext.getImageData(0, 0, width, height);
  }

  //Methods

  getPixel(index) {
    const i = index * 4,
      d = this.map.data;
    return [d[i], d[i + 1], d[i + 2], d[i + 3]]; // [R,G,B,A]
  }

  getPixelXY(x, y) {
    return this.getPixel(y * this.width + x);
  }
}
