// Polyfill for Vercel/Node environment where DOMMatrix/Canvas is missing
// This is required because pdf-parse (via pdf.js) assumes these globals exist for some operations

if (typeof global.DOMMatrix === "undefined") {
    // @ts-ignore
    global.DOMMatrix = class DOMMatrix {
        constructor() { }
        toString() { return "matrix(1, 0, 0, 1, 0, 0)"; }
        translate() { return this; }
        scale() { return this; }
        transformPoint(p: any) { return p; }
    };
}

// Add other missing globals if needed (based on log warnings)
if (typeof global.ImageData === "undefined") {
    // @ts-ignore
    global.ImageData = class ImageData {
        constructor(width: number, height: number) { this.width = width; this.height = height; this.data = new Uint8ClampedArray(width * height * 4); }
        width: number;
        height: number;
        data: Uint8ClampedArray;
    };
}
// Polyfill Path2D to prevent rendering warnings
if (typeof global.Path2D === "undefined") {
    // @ts-ignore
    global.Path2D = class Path2D {
        constructor() { }
        addPath() { }
        closePath() { }
        moveTo() { }
        lineTo() { }
        bezierCurveTo() { }
        quadraticCurveTo() { }
        arc() { }
        arcTo() { }
        ellipse() { }
        rect() { }
    };
}
