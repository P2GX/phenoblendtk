import { inject, Injectable, signal, computed } from "@angular/core";
import { ConfigService } from "./config-service";
import { GeneDiseaseAssociation } from "../models/interfaces";

@Injectable({ providedIn: 'root' })
export class AnnotationService {
  private configService = inject(ConfigService);

  // The user's confirmed gene→disease selections, carried across pages.
  // Keyed by geneSymbol so later stages can look up "what did the user pick for LZTR1".
  private readonly _selectedAssociations = signal<Map<string, GeneDiseaseAssociation[]>>(new Map());

  readonly selectedAssociations = this._selectedAssociations.asReadonly();

  private readonly _observedHpoCount = signal<number>(0);
  readonly observedHpoCount = this._observedHpoCount.asReadonly();
  // Derived counts for the workspace-status footer.
  readonly genesEntered = computed(() => this._selectedAssociations().size);
  readonly diseasesSelected = computed(() => this.allSelectedAssociations().length);


  // Flattened view, handy for anything downstream that just wants a flat list
  readonly allSelectedAssociations = computed(() =>
    Array.from(this._selectedAssociations().values()).flat()
  );

  async autocompleteGeneSymbol(query: string): Promise<GeneDiseaseAssociation[]> {
    return this.configService.autocompleteGeneSymbol(query);
  }

  /**
   * Replaces the entire selection set — call this from the gene/disease
   * picker page when the user confirms their choices.
   */
  setSelectedAssociations(byGene: Map<string, GeneDiseaseAssociation[]>): void {
    this._selectedAssociations.set(new Map(byGene));
  }

  /** Clears everything — e.g. when starting a new case. */
  clearSelectedAssociations(): void {
    this._selectedAssociations.set(new Map());
  }

  readonly workspaceSummaryText = computed(() => {
    const hpoCount = this._observedHpoCount();
    const genes = this.genesEntered();
    const diseases = this.diseasesSelected();

    const hpoText = hpoCount > 0
      ? `Individual with ${hpoCount} observed HPO term${hpoCount === 1 ? '' : 's'}`
      : 'No HPO terms recorded yet';

    const geneText = genes === 0
      ? 'no gene/disease data entered'
      : `${genes} gene${genes === 1 ? '' : 's'} entered, ${diseases} disease${diseases === 1 ? '' : 's'} selected`;

    return `${hpoText}; ${geneText}`;
  });

    /** Records the observed HPO term count — call after phenopacket ingest or text-mining curation completes. */
  setObservedHpoCount(count: number): void {
    this._observedHpoCount.set(count);
  }
}