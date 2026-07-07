export interface SimpleDiseaseModel {
  omimDiseaseId: string;
  omimDiseaseName: string;
  observedHpoIds: string[];
  excludedHpoIds: string[];
}

export interface GeneDiseaseAssociation {
  ncbiGeneId: string;
  geneSymbol: string;
  associationType: string;
  diseaseId: string;
  diseaseModel: SimpleDiseaseModel | null;
  source: string;
}
