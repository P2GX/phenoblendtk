import { inject, Injectable } from "@angular/core";
import { ConfigService } from "./config-service";
import { GeneDiseaseAssociation } from "../models/interfaces";

@Injectable({ providedIn: 'root' })
export class AnnotationService {
    private configService = inject(ConfigService);

  async autocompleteGeneSymbol(query: string): Promise<GeneDiseaseAssociation[]> {
    return this.configService.autocompleteGeneSymbol(query);
  }
}