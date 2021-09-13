/**********************************************
 * Table of content:
 *  00 General Purpose Functions
 *  01 Matrices and Vectors
 *  02 Randomness and Noise
 * 
 *  -1 Dev-Console availabilities
 **********************************************/

/**********************************************
 * 00 General Purpose Functions
 **********************************************/
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**********************************************
 * 01 Matrices and Vectors
 **********************************************/
// Base Vector-Class
export class Vector {
  // Creates vector-object, proxied to allow direct reading without using vArray.
  constructor(...content) {
    this.length = undefined;
    this.vArray = [];

    if (content[0] instanceof Array) {
      this.length = content[0].length;
      
      for (let i = 0; i < content[0].length; i++) {
        this.vArray.push(content[0][i]);
      }
    } else if (typeof(content[0]) === "number") {
      this.length = content.length;

      for (let i = 0; i < content.length; i++) {
        this.vArray.push(content[i]);
      }
    }

    return new Proxy(this, {
      get: function(target, value) {
        // try-catch-block because symbols throw an error using parseInt
        try {
          let v = parseInt(value);

          if (isNaN(v)) return target[value];
          else return target.vArray[v];
        } catch {
          return target[value];
        }
      }
    });
  }

  toString() {
    return `Vector${this.length}`;
  }

  /**
   * Access vector as an array.
   */
  get array() {
    return this.vArray;
  }
  
  get magnitude() {
    let squares = 0;
    for (let i = 0; i < this.length; i++) {
      squares += (this.vArray[i] * this.vArray[i]);
    }

    return Math.sqrt(squares);
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < this.length; i++) {
      yield this.mArray[i];
    }
  }

  /**
   * Multiply this vector with an input value.
   * 
   * @param {Number||Vector||Matrix} value - What this vector will be multiplied by.
   * @param {Boolean} [self=false] - If self, change values of this vector; else create new vector with results.
   * @return {Vector||undefined}
   */
  multiply(value, self = false) {
    // Hadamard-esque vector product.
    if (value instanceof Vector) {
      if (self) {
        for (let i = 0; i < this.length; i++) {
          this.vArray[i] *= value.vArray[i];
        }

        return;
      } else {
        let out = [];
        for (let i = 0; i < this.length; i++) {
          out.push(this.vArray[i] * value.vArray[i]);
        }

        return new Vector(out);
      }
    }

    // Matrix-Vector dot product
    if (value instanceof Matrix) {
      let out = Matrix.dotProduct(value, this);
      if (self) {
        for (let i = 0; i < this.length; i++) {
          this.vArray[i] = out[i];
        }

        return;
      } else {
        return out;
      }
    }

    // Scaling of vector.
    if (typeof(value) === "number") {
      return this.scale(value, self);
    }
  }

  /**
   * Adds this vector and another vector.
   * 
   * @param {Vector} v2 - vector to be added.
   * @param {Boolean} [self=false] - If self, change values of this vector; else create new vector with results.
   * @return {Vector||undefined}
   */
  add(v2, self = false) {
    if (self) {
      for (let i = 0; i < this.length; i++) {
        this.vArray[i] += v2.vArray[i];
      }

      return;
    } else {
      let out = [];
      for (let i = 0; i < this.length; i++) {
        out.push(this.vArray[i] + v2.vArray[i]);
      }

      return new Vector(out);
    }
  }

  /**
   * Creates the dot-/scalar-product of two vectors and returns it.
   * 
   * @param {Vector} v2 - Vector to create the product with.
   * @return {Number}
   */
  dotProduct(v2) {
    let out = 0;
    for (let i = 0; i < this.length; i++) {
      out += (this.vArray[i] * v2.vArray[i]);
    }

    return out;
  }

  /**
   * Normalizes this vector.
   * 
   * @param {Boolean} [self=true] - If self, change values of this vector; else create new vector with results.
   * @return {Vector||undefined}
   */
  normalize(self = true) {
    return this.multiply((1 / this.magnitude), self);
  }

  /**
   * Scales this vector by specified value.
   * 
   * @param {Number} value - Number to scale by.
   * @param {Boolean} [self=true] - If self, change values of this vector; else create new vector with results.
   */
  scale(value, self = true) {
    if (self) {
      for (let i = 0; i < this.length; i++) {
        this.vArray[i] *= value;
      }

      return;
    } else {
      let out = [];
      for (let i = 0; i < this.length; i++) {
        out.push(this.vArray[i] * value);
      }

      return new Vector(out);
    }
  }
}

// Base Matrix-Class
export class Matrix {
  // Creates matrix-object, proxied to allow direct reading of values.
  constructor(...content) {
    this.height = undefined;
    this.width = undefined;
    this.mArray = undefined;

    // Allow direct access to mArray.
    let proxy = new Proxy(this, {
      get: function(target, value) {
        // try-catch-block because symbols throw an error using parseInt
        try {
          let v = parseInt(value);

          if (isNaN(v)) return target[value];
          else return target.mArray[v];
        } catch {
          return target[value];
        }
      }
    });

    // 2D Array
    if (content[0] instanceof Array && content[0][0] instanceof Array) {
      this.height = content[0].length;
      this.width = content[0][0].length;
      this.mArray = [...Array(this.height)].map(() => [...Array(this.width)]);

      for (let i = 0; i < this.height; i++) {
        for (let j = 0; j < this.width; j++) {
          this.mArray[i][j] = content[0][i][j]
        }
      }

      return proxy;
    }

    // Array per row
    if (content[0] instanceof Array && typeof(content[0][0]) === "number") {
      this.height = content.length;
      this.width = content[0].length;
      this.mArray = [...Array(this.height)].map(() => [...Array(this.width)]);

      for (let i = 0; i < this.height; i++) {
        for (let j = 0; j < this.width; j++) {
          this.mArray[i][j] = content[i][j]
        }
      }

      return proxy;
    }

    // Vector per column
    // usually vectors are like single column matrices.
    if (content[0] instanceof Vector) {
      this.height = content[0].length;
      this.width = content.length;
      this.mArray = [...Array(this.height)].map(() => [...Array(this.width)]);

      for (let i = 0; i < this.height; i++) {
        for (let j = 0; j < this.width; j++) {
          this.mArray[i][j] = content[j].asArray[i];
        }
      }

      return proxy;
    }

    // Height, Width, (Height * Width) Numbers
    if (typeof(content[0]) === "number" && typeof(content[1]) === "number" && typeof(content[2]) === "number") {
      this.height = content[0];
      this.width = content[1];
      this.mArray = [...Array(this.height)].map(() => [...Array(this.width)]);
      
      if (content.length !== this.width * this.height + 2) {
        throw new Error(`Matrix::constructor - You need ${this.width * this.height} values for a ${this.height} x ${this.width} Matrix, but gave ${content.length - 2}!`);
      }

      for (let i = 0; i < this.height; i++) {
        for (let j = 0; j < this.width; j++) {
          this.mArray[i][j] = content[2 + (i * this.width + j)];
        }
      }

      return proxy;
    }
  }

  toString() {
    return `Matrix::${this.height}x${this.width}`
  }

  get array2D() {
    return this.mArray;
  }

  get array() {
    let arr = [];
    for (let v of this) {
      arr.push(v);
    }

    return arr;
  }
  
  // Simple iterator/generator to iterate over the 2D array.
  // Iterates row after row. 
  *[Symbol.iterator]() {
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        yield this.mArray[i][j];
      }
    }
  }

  /**
   * Creates identity matrix of given size.
   * 
   * @param {Number} size - amount of rows and columns of resulting matrix (f.e. 4 leads to a 4x4 matrix).
   * @return {Matrix}
   */
  static getIdentity(size) {
    let outArray = [...Array(size)].map(() => [...Array(size)].map(() => 0));
    for (let i = 0; i < size; i++) {
      outArray[i][i] = 1;
    }

    return new Matrix(outArray);
  }

  /**
   * Creates the dot-product of the given matrices (m1 . m2). Vectors will be considered single-column-matrices.
   * If a vector is given as input, will return vector.
   * 
   * @param {Vector||Matrix} m1 - First matrix.
   * @param {Vector||Matrix} m2 - Second matrix.
   * @return {Vector||Matrix}
  */
  static dotProduct(m1, m2) {
    let in1 = m1;
    let in2 = m2;
    let asVector = false;
    
    if (in1 instanceof Vector) {
      in1 = new Matrix(in1);
      asVector = true;
    }
    if (in2 instanceof Vector) {
      in2 = new Matrix(in2);
      asVector = true;
    }

    if (in1.width !== in2.height) {
      throw new Error(`Matrix::dotProduct - Width of the first Matrix needs to be equal to the height of the second Matrix!`);
    }
    
    let outHeight = in1.height;
    let outWidth = in2.width;

    let outArray = [...Array(outHeight)].map(() => [...Array(outWidth)]);

    for (let i = 0; i < outWidth; i++) {
      for (let j = 0; j < outHeight; j++) {
        outArray[j][i] = 0;
        for (let c = 0; c < in1.width; c++) {
          outArray[j][i] += in1.mArray[j][c] * in2.mArray[c][i];
        }
      }
    }

    if (asVector) {
      return new Vector(outArray.map(o => o[0]));
    } else {
      return new Matrix(outArray);
    }
  }
}

// Specific Vectors
export class Vec2 extends Vector {
  // TODO: fill in.
}

export class Vec3 extends Vector {
  // TODO: fill in.
}

// Specific Matrices
export class Mat2x2 extends Matrix {
  constructor(in1, in2, in3, in4) {
    if (typeof(in1) === "number") {
      return super(2, 2, in1, in2, in3, in4);
    } else {
      return super(in1, in2, in3, in4);
    }
  }

  toString() {
    return "Mat2x2";
  }

  static getIdentity() {
    return new Mat2x2(
      [1, 0],
      [0, 1]
      );
  }

  static getScaling(x = 1, y = 1) {
    return new Matrix2x2(
      [x, 0],
      [0, y]
      );
  }

  static getRotation(angle) {
    return new Mat2x2(
      [Math.cos(angle), -Math.sin(angle)],
      [Math.sin(angle), Math.cos(angle)]
      );
  }

  static dotProduct(A, B) {
    if (A instanceof Mat2x2 && B instanceof Mat2x2) {
      let m00, m01;
      let m10, m11;

      m00 = A.mArray[0][0] * B.mArray[0][0] + A.mArray[0][1] * B.mArray[1][0];
      m01 = A.mArray[0][0] * B.mArray[0][1] + A.mArray[0][1] * B.mArray[1][1];
      m10 = A.mArray[1][0] * B.mArray[0][0] + A.mArray[1][1] * B.mArray[1][0];
      m11 = A.mArray[1][0] * B.mArray[0][1] + A.mArray[1][1] * B.mArray[1][1];

      return new Mat2x2(
        [m00, m01],
        [m10, m11]
      );
    } else {
      return Matrix.dotProduct(A, B);
    }
  }
}

export class Mat3x3 extends Matrix {
  toString() {
    return "Mat3x3";
  }

  static getIdentity() {
    return new Matrix3x3(
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
      );
  }

  static getScale() {
    throw new Error("Mat3x3::getScale not yet implemented");  // TODO: implement.
  }

  static getRotation() {
    throw new Error("Mat3x3::getRotation not yet implemented");  // TODO: implement.
  }

  get array2D() {
    return this.mArray;
  }

  get array() {
    return [
      ...this.mArray[0],
      ...this.mArray[1],
      ...this.mArray[2]
    ];
  }
}

/**********************************************
 * 02 Randomness and Noise
 **********************************************/
// Pseudorandom Number Generator (seeded)
/**
 * Creates and returns the PRNG.
 * List of available algorithms can be found through the availableAlgorithms getter.
 * 
 * @param {Number} [seed] - Number to be used as seed, randomized seed if undefined.
 * @param {String} [algo="sfc32"] - Algorithm to be used.
 * @return {function} Pseudorandom number generator based on the seed and algo.
 */
export function prngCreator(seed, algo) {
  seed = seed === undefined || typeof(seed) !== "number" ? Math.floor(Math.random() * 1337 ^ 0xDEADBEEF) : seed;
  seed >>>= 0;  // Casts the seed to an unsigned Integer.

  const availableAlgos = ["sfc32", "Mulberry32", "xoshiro128**"];  // TODO: more implementations.

  if (algo === undefined || typeof(algo) !== "string" || availableAlgos.filter(a => a.toLowerCase() === algo.toLowerCase()).length < 1) {
    if (algo !== undefined) console.warn(`prngCreator - the supplied value for the algo parameter "${algo}" is not available and has been changed to "sfc32".`);
    algo = "sfc32";
  }

  let rng;

  switch(algo.toLowerCase()) {
    case "sfc32":
      // Creates a 32-bit pseudorandom number and squishes it into the [0, 1) range.
      // Seed-padding-numbers: 
      // a: phi = 0x1.61803398875..
      // b: pi = 0x3.243F6A8884C3C..
      // c: e = 0x2.B7E132B55E..
      {let a = 0x9E3779B8, b = 0x243F6A88, c = 0xB7E132B5, d = seed;
      rng = function() {
        a >>>= 0, b >>>= 0, c >>>= 0, d >>>= 0;
        let t = (a + b) | 0;
        a = b ^ b >>> 9;
        b = c + (c << 3) | 0;
        c = (c << 21 | c >>> 11);
        d = d + 1 | 0;
        t = t + d | 0;
        c = c + t | 0;
        return (t >>> 0) / 4294967296;  // 4294967296 = 32-bit-max-int + 1.
      };}
      break;

    case "mulberry32":
      // Creates a 32-bit pseudorandom number and squishes it into the [0, 1) range.
      rng = function() {
        let z = (seed += 0x6D2B79F5);
        z = Math.imul(z ^ (z >>> 15), z | 1);
        z ^= z + Math.imul(z ^ (z >> 7), z | 61);
        return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
      };
      break;

    case "xoshiro128**":
      // Creates a 32-bit pseudorandom number and squishes it into the [0, 1) range.
      // Seed-padding-numbers: 
      // a: phi = 0x1.61803398875..
      // b: pi = 0x3.243F6A8884C3C..
      // c: e = 0x2.B7E132B55E..
      {let a = 0x9E3779B8, b = 0x243F6A88, c = 0xB7E132B5, d = seed;
      rng = function() {
        let t = b << 9;
        let r = a * 5;
        r = (r << 7 | r >>> 25) * 9;
        c ^= a;
        d ^= b;
        b ^= c;
        a ^= d;
        c ^= t;
        d = d << 11 | d >>> 21;
        return (r >>> 0) / 4294967296;
      };}
      break;
    default:
      throw new Error("prngCreator - Should not happen! If it still does, bad sourcecode on my part.. Sorry!");
  }

  return rng;
}


/**********************************************
 * -1 Dev-Console availabilities
 **********************************************/
// 00
window.clamp = clamp;

// 01
// window.Vec2 = Vec2;
// window.Vec3 = Vec3;
window.Mat2x2 = Mat2x2;
window.Mat3x3 = Mat3x3;
window.Matrix = Matrix;
window.Vector = Vector;

// 02
// window.perlin = perlin;
window.prngCreator = prngCreator;