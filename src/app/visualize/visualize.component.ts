import { Component, ViewChild, signal, computed, inject } from '@angular/core';
import * as d3 from 'd3';
import { ConfigService } from '../services/config-service';
import { AnnotationService } from '../services/annotation-service';
import { GeneDiseaseAssociation } from '../models/interfaces';
import { NotificationService } from 'ng-hpo-uikit';
import { PresenceMatrixComponent, PresenceMatrixPayload } from 'projects/ngx-phenoprofile/src/lib/presence-matrix/presence-matrix.component';
import { UpsetPlotComponent, UpsetPlotPayload } from 'projects/ngx-phenoprofile/src/lib/upset/upset-plot.component';


// 1. Define a literal type for your 3 view modes
type VisualizationType = 'matrix' | 'upset' | 'bar';

@Component({
  selector: 'app-presence-visualizer',
  standalone: true,
  imports: [PresenceMatrixComponent, UpsetPlotComponent], 
  templateUrl: './visualize.component.html',
   styleUrls: ['./visualize.component.scss']
})
export class PhenotypeProfileVisualizerComponent {
  @ViewChild('matrixComponent') private childMatrix!: PresenceMatrixComponent;
  @ViewChild('upsetComponent') private childUpset!: UpsetPlotComponent;

  private configService = inject(ConfigService);
  private annotationService = inject(AnnotationService);
  private notificationService = inject(NotificationService);

  readonly matrixData = signal<PresenceMatrixPayload | null>(null);
  readonly upsetData = signal<UpsetPlotPayload | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly activeView = signal<VisualizationType>('matrix');

  // Computed title depending on which view is selected
  readonly currentTitle = computed(() => {
    switch (this.activeView()) {
      case 'matrix': return 'Phenotype Presence Matrix';
      case 'upset': return 'Phenotype Upset Plot';
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
      const result = await this.configService.getPresenceMatrix(recordData);
      const upsetResult = await this.configService.getUpsetPlotPayload(recordData);
      this.upsetData.set(upsetResult);
      console.log("upset", upsetResult);
      this.matrixData.set(result);
    } catch (err) {
      console.error('Failed fetching matrix values:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  exportMatrixToSvg(): void {
    // Kept safe by disabling the button unless activeView() === 'matrix'
    const view = this.activeView();
    if (view !== 'matrix' && view !== 'upset') return;

    try {
      let targetElement: HTMLElement | null = null;
      if (view === 'matrix' && this.childMatrix) {
        targetElement = this.childMatrix['chartContainer'].nativeElement;
      } else if (view === 'upset' && this.childUpset) {
        targetElement = this.childUpset['chartContainer'].nativeElement;
      }
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
