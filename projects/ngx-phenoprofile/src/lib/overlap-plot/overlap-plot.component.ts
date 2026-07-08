// presence-matrix.component.ts
import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild, signal } from '@angular/core';
import { DecimalPipe} from '@angular/common'
import * as d3 from 'd3';
import { PresenceMatrixPayload } from '../models/phenoprofile_dto';




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
export class OverlapPlotComponent implements OnChanges {
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

    const genes = this.data.entities;
    const cols = this.data.columns;

    // Configurable scaling step bounds (similar to your 0.5 inches space calculations)
    const cellSize = 30;
    //const margin = { top: 120, right: 100, bottom: 40, left: 180 };
    const margin = { top: 120, right: 180, bottom: 40, left: 180 };
    const matrixWidth = cols.length * cellSize; // Width of just the matrix grid
    const width = matrixWidth + margin.left + margin.right;
    const height = (genes.length * cellSize) + margin.top + margin.bottom;
   // const width = (cols.length * cellSize) + margin.left + margin.right;
    //const height = (genes.length * cellSize) + margin.top + margin.bottom;

    // 1. Initialize the root SVG canvas viewport
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const mainGroup = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 2. Set up discrete positional linear scales
    const xScale = d3.scaleBand()
      .domain(cols.map(r => r.hpoId))
      .range([0, cols.length * cellSize])
      .padding(0.05);

    const yScale = d3.scaleBand()
      .domain(genes)
      .range([0, genes.length * cellSize])
      .padding(0.05);

    // 3. Custom color interpolator matching your Matplotlib BoundaryNorm step layout
    const colorScale = (score: number): string => {
      if (score >= 1.0) return this.MATCH_COLOR;
      if (score <= 0.0) return this.MISMATCH_COLOR;
      
      // Discrete steps for partial patches (Adjust thresholds as needed!)
      if (score < 0.33) return '#fff2ae'; // Very pale yellow
      if (score < 0.66) return '#fede58'; // Mid yellow
      return this.SIM_COLOR;              // Full yellow (#ffd92f)
    };

    // 4. Render X Axis Headers (HPO Terms turned -45 deg)
    const xLabels = mainGroup.append('g')
      .selectAll('.x-label')
      .data(cols)
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
      .text(d => d.hpoName.length > 42 ? d.hpoName.substring(0, 40) + '...' : d.hpoName);

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
    cols.forEach((row) => {
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
    // ==========================================
// 7. Render Compact Colorbar Legend on the Right
// ==========================================

const legendData = [
  { label: 'match',   color: this.MATCH_COLOR,   showLabel: true },
  { label: '',        color: '#ffd92f',          showLabel: false }, 
  { label: 'partial', color: '#fede58',          showLabel: true }, 
  { label: '',        color: '#fff2ae',          showLabel: false }, 
  { label: 'none',    color: this.MISMATCH_COLOR, showLabel: true }
];

const legendX = matrixWidth + 40; 
const totalLegendHeight = cellSize * 2; // Hard cap the height to exactly 2 rows (~60px)
const legendItemHeight = totalLegendHeight / legendData.length; // ~12px per block
const legendWidth = 15; // Slightly slimmer to match the compact height

// Create a container group for the legend
const legendGroup = mainGroup.append('g')
  .attr('transform', `translate(${legendX}, 0)`);

// Draw the color rectangles
legendGroup.selectAll('.legend-rect')
  .data(legendData)
  .enter()
  .append('rect')
  .attr('x', 0)
  .attr('y', (_, i) => i * legendItemHeight)
  .attr('width', legendWidth)
  .attr('height', legendItemHeight)
  .style('fill', d => d.color)
  .style('stroke', '#333333')
  .style('stroke-width', '1px');

// Add tick marks on the right side of every block boundary
legendGroup.selectAll('.legend-tick')
  .data(d3.range(1, legendData.length)) // 1 to 4 ensures top and bottom outer borders aren't doubled
  .enter()
  .append('line')
  .attr('x1', 0)
  .attr('x2', legendWidth)
  .attr('y1', d => d * legendItemHeight)
  .attr('y2', d => d * legendItemHeight)
  .style('stroke', '#333333')
  .style('stroke-width', '1px');

// Add text labels only for match, partial, and miss
legendGroup.selectAll('.legend-label')
  .data(legendData)
  .enter()
  .filter(d => d.showLabel) // Only render text for the main milestones
  .append('text')
  .attr('x', legendWidth + 10)
  .attr('y', (_, i, nodes) => {
    // Elegant centering: 'match' aligns with top block, 'miss' with bottom block, 'partial' dead center
    const label = d3.select(nodes[i]).datum() as any;
    if (label.label === 'match') return (legendItemHeight / 2);
    if (label.label === 'none') return totalLegendHeight - (legendItemHeight / 2);
    return totalLegendHeight / 2; // 'partial' centered right in the middle of the bar
  })
  .attr('dy', '0.35em')
  .style('font-size', '12px')
  .style('font-family', 'sans-serif')
  .style('fill', '#000000')
  .text(d => d.label);
  }
}

export { PresenceMatrixPayload };
