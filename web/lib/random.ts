const lastIdx: Record<string, number> = {};

export function rnd(n: number): number {
  return Math.floor(Math.random() * n);
}

export function pickNoRepeat<T>(arr: T[], lastIdxKey: string): T {
  let i: number;
  do {
    i = rnd(arr.length);
  } while (arr.length > 1 && i === lastIdx[lastIdxKey]);
  lastIdx[lastIdxKey] = i;
  return arr[i];
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function numberOptions(answer: number, maxNum: number): number[] {
  const opts = [answer];
  let tries = 0;
  while (opts.length < 3 && tries < 80) {
    tries++;
    const delta = 1 + rnd(2);
    const v = answer + (rnd(2) ? delta : -delta);
    if (v >= 1 && v <= maxNum && !opts.includes(v)) opts.push(v);
  }
  let pad = 1;
  while (opts.length < 3) {
    const c = answer + pad;
    if (c >= 1 && c <= maxNum && !opts.includes(c)) opts.push(c);
    pad = pad > 0 ? -pad : -pad + 1;
    if (Math.abs(pad) > maxNum) break;
  }
  while (opts.length < 3) opts.push(answer);
  return shuffle(opts);
}

export function pickDistinct(arr: string[], n: number, exclude: string[]): string[] {
  return shuffle(arr.filter((x) => !exclude.includes(x))).slice(0, n);
}

export function pickDistinctBy<T>(
  arr: T[],
  n: number,
  excludeVals: unknown[],
  keyFn: (x: T) => unknown
): T[] {
  return shuffle(arr.filter((x) => !excludeVals.includes(keyFn(x)))).slice(0, n);
}

export function repeatStr(s: string, n: number): string {
  return Array(n).fill(s).join("");
}
