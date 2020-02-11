import { words } from "./words";

class Random {
  _seed = 0;
  constructor(seed: number) {
    this._seed = seed % 2147483647;
    if (this._seed <= 0) this._seed += 2147483646;
  }

  next() {
    return (this._seed = (this._seed * 16807) % 2147483647);
  }
}

function xmur3(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function generateIndices(
  seed: string,
  mod = words.length,
  len = 300
): number[] {
  let offset = 0;
  let ctsize = 0;
  let cheats: number[] = [];

  try {
    seed = atob(seed);
    offset = seed.charCodeAt(0) * 255 + seed.charCodeAt(1);
    ctsize = seed.charCodeAt(2);
    cheats = [];
    for (let i = 3; (i - 3) / 2 < ctsize && i + 1 < seed.length; i += 2) {
      const char = seed.charCodeAt(i) * 255 + seed.charCodeAt(i + 1);
      cheats.push(char);
    }
  } catch (e) {
    console.info("we clean");
  }

  const rand = new Random(xmur3(seed)());
  const gend: number[] = [];
  for (let i = 0; i < len; i++) {
    if (i >= offset && i < offset + cheats.length) {
      gend.push(cheats[i - offset]);
      continue;
    }
    const value = (rand.next() % mod) + mod * 0.1;
    const generated = value;
    gend.push(generated);
  }
  return gend;
}

function translateToWords(indices: number[]): string[] {
  return indices.map(i => words[i] || ".");
}

function generateAddress(
  offset: number,
  cheats: number[],
  suffix = ""
): string {
  let buf = "";
  buf += String.fromCharCode(Math.floor(offset / 255));
  buf += String.fromCharCode(offset % 255);
  buf += String.fromCharCode(cheats.length);
  for (let i = 0; i < cheats.length; i++) {
    buf += String.fromCharCode(Math.floor(cheats[i] / 255));
    buf += String.fromCharCode(cheats[i] % 255);
  }
  buf += suffix;
  return btoa(buf);
}

function indicesOf(cheats: string[]): number[] {
  return cheats.map(word => words.indexOf(word)).filter(idx => idx >= 0);
}

function generateBook(seed: string, length: number) {
  const indices = generateIndices(seed, words.length, length);
  return translateToWords(indices).join(" ");
}

function main() {
  const length = 100;
  const cheats = indicesOf(["come", "and", "find", "some"]);
  const seed = generateAddress(32, cheats, "hello");

  console.log(seed);
  console.log(generateBook(seed, length));
}

main();
