export interface PresenceMatrixRow {
  hpoId: string;
  hpoName: string;
  // Keyed by Gene Symbol, value ranges from [0.0 to 1.0]
  scores: { [geneSymbol: string]: number };
}

export interface PresenceMatrixPayload {
  entities: string[]; // Already sorted by your column ranking rules
  columns: PresenceMatrixRow[]; // Already sorted by your tier blocks
}

export interface UpsetPlotPayload {
  genes: string[];
  combinations: string[][];
  combinationAnnotated: number[];
  combinationObserved: number[];
  geneAnnotated: number[];
  geneObserved: number[];
}
