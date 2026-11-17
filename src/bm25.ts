// BM25: the classic way to rank documents for a search. Small, exact and fast (6,236 short documents).
export interface Hit { doc: number; score: number; matched: number; matchedIdf: number }

export class Bm25 {
  private readonly index = new Map<string, Array<[doc: number, tf: number]>>();
  private readonly len: number[] = [];
  private readonly avg: number;

  constructor(docs: string[][], private readonly k1 = 1.2, private readonly b = 0.75) {
    docs.forEach((tokens, d) => {
      this.len.push(tokens.length);
      const tf = new Map<string, number>();
      for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
      for (const [t, n] of tf) {
        let list = this.index.get(t);
        if (!list) this.index.set(t, (list = []));
        list.push([d, n]);
      }
    });
    this.avg = this.len.reduce((a, b2) => a + b2, 0) / Math.max(1, this.len.length);
  }

  get size(): number { return this.len.length; }
  /** Weight of a word that is NOT in any document: as heavy as the rarest word. */
  unknownIdf(): number { return Math.log(1 + (this.size + 0.5) / 0.5); }
  df(term: string): number { return this.index.get(term)?.length ?? 0; }
  idf(term: string): number {
    const df = this.df(term);
    return Math.log(1 + (this.size - df + 0.5) / (df + 0.5));
  }

  search(query: string[], limit = 10): Hit[] {
    const scores = new Map<number, number>();
    const matched = new Map<number, number>();
    const matchedIdf = new Map<number, number>();
    for (const term of new Set(query)) {
      const list = this.index.get(term);
      if (!list) continue;
      const idf = this.idf(term);
      for (const [d, tf] of list) {
        const norm = this.k1 * (1 - this.b + (this.b * this.len[d]) / this.avg);
        scores.set(d, (scores.get(d) ?? 0) + (idf * tf * (this.k1 + 1)) / (tf + norm));
        matched.set(d, (matched.get(d) ?? 0) + 1);
        matchedIdf.set(d, (matchedIdf.get(d) ?? 0) + idf);
      }
    }
    return [...scores.entries()].map(([doc, score]) => ({ doc, score, matched: matched.get(doc) ?? 0, matchedIdf: matchedIdf.get(doc) ?? 0 })).sort((x, y) => y.score - x.score || x.doc - y.doc).slice(0, limit);
  }
}
