import { Component, ViewChild, signal, computed, inject } from '@angular/core';
import * as d3 from 'd3';
import { ConfigService } from '../services/config-service';
import { AnnotationService } from '../services/annotation-service';
import { GeneDiseaseAssociation } from '../models/interfaces';
import { NotificationService } from 'ng-hpo-uikit';
import { OverlapPlotComponent, PresenceMatrixPayload } from 'projects/ngx-phenoprofile/src/lib/overlap-plot/overlap-plot.component';
import { UpsetPlotComponent, UpsetPlotPayload } from 'projects/ngx-phenoprofile/src/lib/upset/upset-plot.component';
import { SpreadPlotComponent } from 'projects/ngx-phenoprofile/src/lib/spread-plot/spread-plot.component';
import { SpreadPlotPayload } from 'projects/ngx-phenoprofile/src/lib/models/phenoprofile_dto';


// 1. Define a literal type for your 3 view modes
type VisualizationType = 'overlap' | 'upset' | 'spread';

@Component({
  selector: 'app-presence-visualizer',
  standalone: true,
  imports: [OverlapPlotComponent, UpsetPlotComponent, SpreadPlotComponent], 
  templateUrl: './visualize.component.html',
   styleUrls: ['./visualize.component.scss']
})
export class PhenotypeProfileVisualizerComponent {
  @ViewChild('overlapComponent') private childMatrix!: OverlapPlotComponent;
  @ViewChild('upsetComponent') private childUpset!: UpsetPlotComponent;
  @ViewChild('spreadComponent') private childSpread!: SpreadPlotComponent;

  private configService = inject(ConfigService);
  private annotationService = inject(AnnotationService);
  private notificationService = inject(NotificationService);

  readonly matrixData = signal<PresenceMatrixPayload | null>(null);
  readonly upsetData = signal<UpsetPlotPayload | null>(null);
  readonly spreadData = signal<SpreadPlotPayload | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly activeView = signal<VisualizationType>('overlap');

  // Computed title depending on which view is selected
  readonly currentTitle = computed(() => {
    switch (this.activeView()) {
      case 'overlap': return 'Phenotypic Overlap Plot';
      case 'upset': return 'Phenotypic Upset Plot';
      case 'spread': return 'Phenotypic Spread Plot';
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
      const overlapResult = await this.configService.getOverlapPlotData(recordData);
      const upsetResult = await this.configService.getUpsetPlotPayload(recordData);
      const spreadResult = await this.configService.getSpreadPlotPayload(recordData);
      this.upsetData.set(upsetResult);
      this.matrixData.set(overlapResult);
      this.spreadData.set(spreadResult);
    } catch (err) {
      console.error('Failed fetching matrix values:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  exportMatrixToSvg(): void {
    // Kept safe by disabling the button unless activeView() === 'matrix'
    const view = this.activeView();
    if (view !== 'overlap' && view !== 'upset' && view !== 'spread') return;

    try {
      let targetElement: HTMLElement | null = null;
      if (view === 'overlap' && this.childMatrix) {
        targetElement = this.childMatrix['chartContainer'].nativeElement;
      } else if (view === 'upset' && this.childUpset) {
        targetElement = this.childUpset['chartContainer'].nativeElement;
      } else if (view === 'spread' && this.childSpread) {
         targetElement = this.childSpread['chartContainer'].nativeElement;
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

export { OverlapPlotComponent as PresenceMatrixComponent };
