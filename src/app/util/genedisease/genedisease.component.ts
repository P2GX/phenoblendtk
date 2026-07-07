
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { CommonModule } from '@angular/common';
import { GeneDiseaseAssociation } from '../../models/interfaces';
import { AnnotationService } from '../../services/annotation-service';

@Component({
  selector: 'genedisease',
  standalone: true,
  imports: [ 
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
    templateUrl: './genedisease.component.html',
  styleUrls: ['./genedisease.component.scss']
})
export class GeneDiseaseComponent {
 
  private readonly annotationService = inject(AnnotationService);

  geneSymbol = '';

  associations: GeneDiseaseAssociation[] = [];

  loading = false;

  error?: string;

  async search(): Promise<void> {
    const query = this.geneSymbol.trim();
    console.log("u", query);
    if (!query) {
      this.associations = [];
      return;
    }

    this.loading = true;
    this.error = undefined;

    try {
      this.associations =
        await this.annotationService.autocompleteGeneSymbol(query);
    } catch (e) {
      console.error(e);
      this.error = 'Unable to retrieve gene information.';
      this.associations = [];
    } finally {
      this.loading = false;
    }
  }

}