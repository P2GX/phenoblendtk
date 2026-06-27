export interface PresenceMatrixRow {
  hpoId: string;
  hpoName: string;
  // Keyed by Gene Symbol, value ranges from [0.0 to 1.0]
  scores: { [geneSymbol: string]: number };
}

export interface PresenceMatrixPayload {
  genes: string[]; // Already sorted by your column ranking rules
  rows: PresenceMatrixRow[]; // Already sorted by your tier blocks
}