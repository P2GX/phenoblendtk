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
}