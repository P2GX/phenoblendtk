// presence-matrix.component.ts
import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild, signal } from '@angular/core';
import { DecimalPipe} from '@angular/common'
import * as d3 from 'd3';

export interface PresenceMatrixRow {
  hpoId: string;
  hpoName: string;
  scores: { [geneSymbol: string]: number };
}

export interface PresenceMatrixPayload {
  genes: string[];
  rows: PresenceMatrixRow[];
}

@Component({
  selector: 'app-presence-matrix',
  standalone: true,
  template: `
    <div class="matrix-container" style="position: relative;">
      <div #matrixSvgContainer></div>
      @if (tooltipData(); as data) {
        <div class="matrix-tooltip" [style.left.px]="data.x" [style.top.px]="data.y">
          <strong>{{ data.gene }}</strong> ↔ <strong>{{ data.hpoId }}</strong><br>
          <span class="label">{{ data.hpoName }}</span><br>
          <span class="score">Match Value: {{ data.score | number:'1.2-2' }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .matrix-container { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .matrix-tooltip {
      position: absolute;
      padding: 8px 12px;
      background: rgba(33, 37, 41, 0.95);
      color: #fff;
      border-radius: 4px;
      font-size: 12px;
      pointer-events: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      z-index: 10;
      transform: translate(-50%, -110%);
    }
    .matrix-tooltip .label { color: #adb5bd; font-style: italic; }
    .matrix-tooltip .score { color: #66C2A5; font-weight: bold; }
  `],
  imports: [DecimalPipe]
})
export class PresenceMatrixComponent implements OnChanges {
  @ViewChild('matrixSvgContainer', { static: true }) private chartContainer!: ElementRef;
  @Input({ required: true }) data!: PresenceMatrixPayload;

  // Track tooltips elegantly using an Angular signal
  readonly tooltipData = signal<{ x: number; y: number; gene: string; hpoId: string; hpoName: string; score: number } | null>(null);

  // Match your exact Matplotlib configuration profile colors
  private readonly MATCH_COLOR = '#66C2A5';
  private readonly SIM_COLOR = '#ffd92f';
  private readonly MISMATCH_COLOR = '#ffffff';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.renderMatrixChart();
    }
  }

  private renderMatrixChart(): void {
    // Clear out any stale layouts if rendering updates sequentially
    const container = this.chartContainer.nativeElement;
    container.innerHTML = '';

    const genes = this.data.genes;
    const rows = this.data.rows;

    // Configurable scaling step bounds (similar to your 0.5 inches space calculations)
    const cellSize = 30;
    const margin = { top: 120, right: 100, bottom: 40, left: 180 };

    const width = (rows.length * cellSize) + margin.left + margin.right;
    const height = (genes.length * cellSize) + margin.top + margin.bottom;

    // 1. Initialize the root SVG canvas viewport
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const mainGroup = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 2. Set up discrete positional linear scales
    const xScale = d3.scaleBand()
      .domain(rows.map(r => r.hpoId))
      .range([0, rows.length * cellSize])
      .padding(0.05);

    const yScale = d3.scaleBand()
      .domain(genes)
      .range([0, genes.length * cellSize])
      .padding(0.05);

    // 3. Custom color interpolator matching your Matplotlib BoundaryNorm step layout
    const colorScale = (score: number): string => {
      if (score >= 1.0) return this.MATCH_COLOR;
      if (score <= 0.0) return this.MISMATCH_COLOR;
      
      // Interpolate partial matches down through your yellow simcolor alphas
      return d3.interpolateLab(d3.lab(this.SIM_COLOR).copy({ l: 90 }), this.SIM_COLOR)(score);
    };

    // 4. Render X Axis Headers (HPO Terms turned -45 deg)
    const xLabels = mainGroup.append('g')
      .selectAll('.x-label')
      .data(rows)
      .enter()
      .append('g')
      .attr('transform', d => `translate(${xScale(d.hpoId)! + xScale.bandwidth() / 2}, 0)`);

    xLabels.append('text')
      .attr('transform', 'rotate(-45)')
      .attr('dx', '-0.6em')
      .attr('dy', '-0.5em')
      .style('text-anchor', 'start')
      .style('font-size', '11px')
      .style('font-weight', '500')
      .text(d => d.hpoName.length > 22 ? d.hpoName.substring(0, 20) + '...' : d.hpoName);

    // 5. Render Y Axis Headers (Gene Symbols)
    mainGroup.append('g')
      .selectAll('.y-label')
      .data(genes)
      .enter()
      .append('text')
      .attr('x', -12)
      .attr('y', d => yScale(d)! + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .style('text-anchor', 'end')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text(d => d);

    // 6. Draw the Presence Circle Grid Nodes
    rows.forEach((row) => {
      genes.forEach((gene) => {
        const score = row.scores[gene] ?? 0.0;
        const cx = xScale(row.hpoId)! + xScale.bandwidth() / 2;
        const cy = yScale(gene)! + yScale.bandwidth() / 2;

        const cellGroup = mainGroup.append('g')
          .attr('class', 'cell-node');

        // Render an invisible tracking rectangle wrapper to make hovering easy for small dots
        cellGroup.append('rect')
          .attr('x', xScale(row.hpoId)!)
          .attr('y', yScale(gene)!)
          .attr('width', xScale.bandwidth())
          .attr('height', yScale.bandwidth())
          .style('fill', 'transparent')
          .style('cursor', 'pointer')
          .on('mouseover', (event) => {
            // Highlight row/column intersections dynamically by shifting opacity
            d3.select(event.currentTarget.parentNode).select('circle')
              .style('stroke-width', '2px')
              .attr('r', (xScale.bandwidth() / 2) - 1);

            this.tooltipData.set({
              x: event.layerX,
              y: event.layerY,
              gene: gene,
              hpoId: row.hpoId,
              hpoName: row.hpoName,
              score: score
            });
          })
          .on('mousemove', (event: { layerX: any; layerY: any; }) => {
            this.tooltipData.update(current => current ? { ...current, x: event.layerX, y: event.layerY } : null);
          })
          .on('mouseleave', (event: { currentTarget: { parentNode: any; }; }) => {
            d3.select(event.currentTarget.parentNode).select('circle')
              .style('stroke-width', '1px')
              .attr('r', (xScale.bandwidth() / 2) - 3);

            this.tooltipData.set(null);
          });

        // The actual visual circle indicator node
        cellGroup.append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', (xScale.bandwidth() / 2) - 3)
          .style('fill', colorScale(score))
          .style('stroke', '#333333')
          .style('stroke-width', '1px')
          .style('pointer-events', 'none'); // Let pointer events fall directly through to the tracking rect
      });
    });
  }
}