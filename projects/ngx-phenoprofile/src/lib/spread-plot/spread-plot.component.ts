// spread-plot.component.ts
import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { SpreadPlotPayload } from '../models/phenoprofile_dto';



@Component({
  selector: 'app-spread-plot',
  standalone: true,
  template: `<div #chartContainer class="spread-container"></div>`,
  styles: [`
    .spread-container {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `]
})
export class SpreadPlotComponent implements OnChanges {
  //@ViewChild('chartContainer', { static: true }) private chartContainer!: ElementRef;
    @ViewChild('chartContainer', { static: true }) chartContainerRef!: ElementRef<HTMLElement>;

  @Input({ required: true }) data!: SpreadPlotPayload;

  private readonly CATEGORY_ALIASES: Record<string, string> = {
    "HP:0000119": "Genitourinary", "HP:0000152": "Head/neck", "HP:0000478": "Eye",
    "HP:0000598": "Ear", "HP:0000707": "Nervous system", "HP:0000769": "Breast",
    "HP:0000818": "Endocrine", "HP:0001197": "Prenatal/birth", "HP:0001507": "Growth",
    "HP:0001574": "Integument (skin)", "HP:0001608": "Voice", "HP:0001626": "Cardiovascular",
    "HP:0001871": "Blood", "HP:0001939": "Metabolism", "HP:0002086": "Respiratory",
    "HP:0002664": "Neoplasm", "HP:0002715": "Immune", "HP:0025031": "Digestive",
    "HP:0025142": "Constitutional", "HP:0025354": "Cellular", "HP:0033127": "Musculoskeletal",
    "HP:0040064": "Limbs", "HP:0045027": "Thoracic cavity"
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.renderSpreadPlot();
    }
  }

  private renderSpreadPlot(): void {
    const container = this.chartContainerRef.nativeElement;
    container.innerHTML = '';

    const { seriesLabels, categories } = this.data;
    const nCategories = categories.length;
    const geneSeries = seriesLabels.filter(l => l !== 'Ppkt');
    const nSeries = seriesLabels.length;

    // Dimensions - Slightly expanded canvas bounds for breathing room
    const width = 760;  
    const height = 760;
    const margin = 110; 
    const outerRadius = Math.min(width, height) / 2 - margin;
    const innerRadius = 120; 

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Max boundary calculation
    const maxVal = d3.max(categories, c => Math.max(c.ppktValue, ...c.geneValues.map(v => isNaN(v) ? 0 : v))) || 1.0;
    const rMax = maxVal * 1.1;

    // Scales
    const rScale = d3.scaleLinear()
      .domain([-0.1, rMax]) 
      .range([innerRadius, outerRadius]);

    // Color Maps
    const hclColors = d3.range(nCategories).map(i => d3.hcl((i / nCategories) * 360, 60, 65));
    const ppktColor = '#1e718a'; // Dark blue

    const shadeColor = (baseHex: string, frac: number): string => {
      const c = d3.rgb(baseHex);
      return d3.rgb(c.r + (255 - c.r) * frac, c.g + (255 - c.g) * frac, c.b + (255 - c.b) * frac).toString();
    };

    const globalOffset = Math.PI / 2 + Math.PI / nCategories;
    const categoryAngles = d3.range(nCategories).map(i => (i * 2 * Math.PI) / nCategories);
    const seriesWidth = (2 * Math.PI) / (nCategories * (nSeries + 1));

    // ==========================================
    // 1. DRAW RADIAL BARS
    // ==========================================
    categories.forEach((cat, catIdx) => {
      const baseAngle = categoryAngles[catIdx];

      // --- FIX 1: Repaired indexing offset logic for true max calculation ---
      const localMaxVal = d3.max(seriesLabels, (seriesName, index) => {
        const v = seriesName === 'Ppkt' ? cat.ppktValue : cat.geneValues[index - 1];
        return isNaN(v) || v === null ? 0 : v;
      }) || 0;

      // --- FIX 2: Ensure label radius clears neighboring tall bars by enforcing a minimum baseline fallback ---
      const groupMaxVal = Math.max(localMaxVal, maxVal * 0.45);
      const groupLabelRadius = rScale(groupMaxVal) + 26;
      
      seriesLabels.forEach((seriesName, sIdx) => {
        // --- FIX 3: Corrected downstream array lookup index mapping ---
        const val = seriesName === 'Ppkt' ? cat.ppktValue : cat.geneValues[sIdx - 1];
        if (isNaN(val) || val === null) return;

        const seriesOffset = (sIdx - (nSeries - 1) / 2) * seriesWidth;
        const currentAngle = baseAngle + seriesOffset + globalOffset;

        let color = ppktColor;
        if (seriesName !== 'Ppkt') {
          const gIdx = geneSeries.indexOf(seriesName);
          const fraction = (gIdx / nSeries) * 0.6;
          color = shadeColor(hclColors[catIdx].toString(), fraction);
        }

        const arc = d3.arc()
          .innerRadius(rScale(0))
          .outerRadius(rScale(val))
          .startAngle(currentAngle - seriesWidth / 2)
          .endAngle(currentAngle + seriesWidth / 2);

        svg.append('path')
          .attr('d', arc as any)
          .style('fill', color);

        // ==========================================
        // --- GENE LABELS (RADIAL RADIAL & LEFT-TO-RIGHT) ---
        // ==========================================
        const labelAngleRaw = currentAngle - Math.PI / 2;
        const xPos = groupLabelRadius * Math.cos(labelAngleRaw);
        const yPos = groupLabelRadius * Math.sin(labelAngleRaw);
        
        let labelRotationDeg = (currentAngle * 180) / Math.PI;
        labelRotationDeg = (labelRotationDeg % 360 + 360) % 360;

        let textAnchor = 'start';
        let finalRotation = labelRotationDeg + 90;

        const normalizedTextAngle = (finalRotation % 360 + 360) % 360;
        if (normalizedTextAngle > 90 && normalizedTextAngle < 270) {
          finalRotation -= 180;
          textAnchor = 'end';
        }

        svg.append('text')
          .attr('x', xPos)
          .attr('y', yPos)
          .attr('transform', `rotate(${finalRotation}, ${xPos}, ${yPos})`)
          .style('text-anchor', textAnchor)
          .style('dominant-baseline', 'central')
          .style('font-size', '8px') 
          .style('fill', '#1a202c') 
          .text(seriesName);
      });

      // ==========================================
      // 2. GRID LINES & ACCENTS
      // ==========================================
      const minGroupAngle = baseAngle - (nSeries / 2) * seriesWidth + globalOffset;
      const maxGroupAngle = baseAngle + (nSeries / 2) * seriesWidth + globalOffset;

      const tickStep = rMax < 0.5 ? 0.1 : 0.2;
      const ticks = d3.range(0, rMax, tickStep);
      ticks.forEach(tick => {
        const gridArc = d3.arc()
          .innerRadius(rScale(tick))
          .outerRadius(rScale(tick) + 0.5)
          .startAngle(minGroupAngle)
          .endAngle(maxGroupAngle);
        svg.append('path').attr('d', gridArc as any).style('fill', 'grey').style('opacity', 0.25);
      });

      const baseLineArc = d3.arc().innerRadius(rScale(0)).outerRadius(rScale(0) + 1).startAngle(minGroupAngle).endAngle(maxGroupAngle);
      svg.append('path').attr('d', baseLineArc as any).style('fill', 'grey');

      // ==========================================
      // --- ORGAN LABELS (INNER CIRCLE DEEP) ---
      // ==========================================
      const displayName = cat.alias || this.CATEGORY_ALIASES[cat.id] || cat.name;
      const labelAngle = baseAngle + globalOffset;
      const textAngleDeg = (labelAngle * 180) / Math.PI;
      const textPosRadius = 55; 

      let rotation = textAngleDeg - 90;
      let alignment = 'start';

      if (baseAngle <= Math.PI) {
        alignment = 'end';
        rotation += 180;
      }

      svg.append('text')
        .attr('x', textPosRadius * Math.cos(labelAngle - Math.PI / 2))
        .attr('y', textPosRadius * Math.sin(labelAngle - Math.PI / 2))
        .attr('transform', `rotate(${rotation}, ${textPosRadius * Math.cos(labelAngle - Math.PI / 2)}, ${textPosRadius * Math.sin(labelAngle - Math.PI / 2)})`)
        .style('text-anchor', alignment)
        .style('dominant-baseline', 'central')
        .style('font-size', '9px')
        .style('font-weight', 'bold')
        .style('fill', '#2d3748')
        .text(displayName);
    });

    // ==========================================
    // 3. SCALE LEGEND (Metric Axis)
    // ==========================================
    const tickStep = rMax < 0.5 ? 0.1 : 0.2;
    const ticks = d3.range(0, rMax, tickStep);
    const gapAngle = Math.PI / 2 - globalOffset - Math.PI / 2;
    ticks.forEach(tick => {
      svg.append('text')
        .attr('x', rScale(tick) * Math.cos(gapAngle))
        .attr('y', rScale(tick) * Math.sin(gapAngle))
        .style('text-anchor', 'middle').style('dominant-baseline', 'central').style('font-size', '8px').style('fill', 'grey')
        .text(tick.toFixed(1));
    });

    // ==========================================
    // --- TINY DOT CENTER PINPRICK ---
    // ==========================================
    svg.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 3) 
      .style('fill', '#718096');
  }
}