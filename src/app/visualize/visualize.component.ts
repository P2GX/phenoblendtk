import { Component, ViewChild, signal, computed, inject } from '@angular/core';
// Assuming you create or have these placeholders ready for the other two:
// import { NetworkGraphComponent } from './network-graph.component';
// import { DistributionBarComponent } from './distribution-bar.component';
import * as d3 from 'd3';
import { PresenceMatrixComponent } from './presence-matrix/presence-matrix.component';
import { PresenceMatrixPayload } from '../models/viz_dto';
import { ConfigService } from '../services/config-service';
import { AnnotationService } from '../services/annotation-service';
import { GeneDiseaseAssociation } from '../models/interfaces';
import { NotificationService } from 'ng-hpo-uikit';

// 1. Define a literal type for your 3 view modes
type VisualizationType = 'matrix' | 'network' | 'bar';

@Component({
  selector: 'app-presence-visualizer',
  standalone: true,
  imports: [PresenceMatrixComponent], 
  templateUrl: './visualize.component.html',
   styleUrls: ['./visualize.component.scss']
})
export class PresenceVisualizerComponent {
  @ViewChild('matrixComponent') private childMatrix!: PresenceMatrixComponent;

  private configService = inject(ConfigService);
  private annotationService = inject(AnnotationService);
  private notificationService = inject(NotificationService);

  readonly matrixData = signal<PresenceMatrixPayload | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly activeView = signal<VisualizationType>('matrix');

  // Computed title depending on which view is selected
  readonly currentTitle = computed(() => {
    switch (this.activeView()) {
      case 'matrix': return 'Phenotype Presence Matrix';
      case 'network': return 'Phenotypic Network Graph';
      case 'bar': return 'Phenotypic Distribution Bar Chart';
    }
  });

  // Handler for drop-down change event - change view type
  onViewChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.activeView.set(target.value as VisualizationType);
  }

  async reloadMatrixData(): Promise<void> {
    this.isLoading.set(true);
    try {
      const selectedAnnotations: GeneDiseaseAssociation[] = this.annotationService.allSelectedAssociations();
      if (selectedAnnotations.length < 2) {
        const errMsg = `At least two gene/disease pairs required to perform analysis but only {selectedAnnotations.length} available.`;
        this.notificationService.showError(errMsg);
        return;
      }
      const recordData = Object.fromEntries(this.annotationService.selectedAssociations());
      console.log("GOT RECORD DARA", recordData);
      const result = await this.configService.getPresenceMatrix(recordData);
      console.log("PresenceMatrixData", result);
      this.matrixData.set(result);
    } catch (err) {
      console.error('Failed fetching matrix values:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  exportMatrixToSvg(): void {
    // Kept safe by disabling the button unless activeView() === 'matrix'
    if (this.activeView() !== 'matrix' || !this.childMatrix) return;

    try {
      const svgElement = d3.select(this.childMatrix['chartContainer'].nativeElement).select('svg').node() as SVGElement;
      if (!svgElement) {
        alert("Matrix visualization element not found.");
        return;
      }

      const svgClone = svgElement.cloneNode(true) as SVGElement;
      svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svgClone.setAttribute('version', '1.1');

      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svgClone);
      svgString = '<?xml version="1.0" standalone="no"?>\n' + svgString;

      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(svgBlob);

      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = `hpo_presence_matrix_${new Date().toISOString().split('T')[0]}.svg`;
      
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Vector serialization failure:', error);
    }
  }
}

export { PresenceMatrixComponent };
