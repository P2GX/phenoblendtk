import { Component, ViewChild, signal } from '@angular/core';
import { PresenceMatrixComponent, PresenceMatrixPayload } from './presence-matrix.component';
import { invoke } from '@tauri-apps/api/core';
import d3 from 'd3';

@Component({
  selector: 'app-presence-visualizer',
  standalone: true,
  imports: [PresenceMatrixComponent],
  template: `
    <div class="visualizer-card">
      <div class="action-bar">
        <div class="title-group">
          <h2>Phenotypic Presence Matrix</h2>
          <p class="subtitle">HPO Term annotations mapped across selected genotypes</p>
        </div>
        
        <div class="button-group">
          <button class="btn btn-secondary" (click)="reloadMatrixData()" [disabled]="isLoading()">
            🔄 Refresh Data
          </button>
          <button class="btn btn-primary" (click)="exportMatrixToSvg()" [disabled]="isLoading() || !matrixData()">
            📤 Export SVG Vector
          </button>
        </div>
      </div>

      <hr class="divider" />

      @if (isLoading()) {
        <div class="loading-state">
          <p>Computing matrix sorting matrices in Rust engine...</p>
        </div>
      } @else if (matrixData(); as data) {
        <app-presence-matrix #matrixComponent [data]="data"></app-presence-matrix>
      } @else {
        <div class="empty-state">
          <p>No active case data loaded to visualize.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .visualizer-card { background: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    .action-bar { display: flex; justify-content: space-between; align-items: center; }
    .title-group h2 { margin: 0 0 4px 0; font-size: 18px; color: #212529; }
    .title-group p { margin: 0; font-size: 13px; color: #6c757d; }
    .button-group { display: flex; gap: 12px; }
    .btn { padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; border: 1px solid transparent; transition: all 0.2s; }
    .btn-primary { background-color: #66C2A5; color: #ffffff; }
    .btn-primary:hover { background-color: #52b093; }
    .btn-secondary { background-color: #f8f9fa; border-color: #ced4da; color: #495057; }
    .btn-secondary:hover { background-color: #e9ecef; }
    .divider { border: 0; border-top: 1px solid #e9ecef; margin: 20px 0; }
    .loading-state, .empty-state { padding: 60px; text-align: center; color: #6c757d; font-style: italic; }
  `]
})
export class PresenceVisualizerComponent {
  // Use a template reference variable to access the child's element hierarchy directly
  @ViewChild('matrixComponent') private childMatrix!: PresenceMatrixComponent;

  readonly matrixData = signal<PresenceMatrixPayload | null>(null);
  readonly isLoading = signal<boolean>(false);

  async reloadMatrixData(): Promise<void> {
    this.isLoading.set(true);
    try {
      // Fetch the pre-sorted matrix data layout from your Rust Tauri commands
      const result = await invoke<PresenceMatrixPayload>('get_sorted_presence_matrix');
      this.matrixData.set(result);
    } catch (err) {
      console.error('Failed fetching matrix values:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Captures the live D3 SVG element tree, injects standard XML namespaces, 
   * and triggers a local file download directly via the browser.
   */
  exportMatrixToSvg(): void {
    if (!this.childMatrix) return;

    try {
      // 1. Reach out to the native DOM element inside your presentation component
      const svgElement = d3.select(this.childMatrix['chartContainer'].nativeElement).select('svg').node() as SVGElement;
      
      if (!svgElement) {
        alert("Matrix visualization element not found.");
        return;
      }

      // 2. Clone the node so we can safely strip web tooltips or modify styles without blinking the UI
      const svgClone = svgElement.cloneNode(true) as SVGElement;

      // Ensure explicit standalone XML namespace tags are attached for external vector readers (Inkscape/Illustrator)
      svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svgClone.setAttribute('version', '1.1');

      // 3. Serialize the XML DOM tree layout into a raw text string context stream
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svgClone);

      // Add standard XML declaration header prefixing
      svgString = '<?xml version="1.0" standalone="no"?>\n' + svgString;

      // 4. Create an ephemeral blob payload link object track to trigger native save downloads
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(svgBlob);

      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = `hpo_presence_matrix_${new Date().toISOString().split('T')[0]}.svg`;
      
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // Clean up memory buffers safely
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobUrl);

    } catch (error) {
      console.error('Vector serialization failure:', error);
    }
  }
}