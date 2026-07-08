// upset-plot.stories.ts
import { Meta, StoryObj } from '@storybook/angular';
import { UpsetPlotComponent, UpsetPlotPayload } from './upset-plot.component';

const meta: Meta<UpsetPlotComponent> = {
  title: 'Components/UpsetPlot',
  component: UpsetPlotComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<UpsetPlotComponent>;

// Construct a rich dataset representing typical gene-phenotype intersection distributions
const mockPayload: UpsetPlotPayload = {
  genes: ['MBNL1', 'DMPK', 'CNBP', 'FXN'],
  combinations: [
    ['MBNL1', 'DMPK', 'CNBP'], // Combination 1
    ['DMPK', 'CNBP'],          // Combination 2
    ['MBNL1', 'DMPK'],         // Combination 3
    ['FXN'],                   // Combination 4
    ['DMPK'],                  // Combination 5
    ['MBNL1'],                 // Combination 6
    ['CNBP']                   // Combination 7
  ],
  // Vertical Stacked Bar Chart Metrics (Top-Right)
  combinationAnnotated: [140, 95, 78, 55, 42, 30, 18],
  combinationObserved:  [115, 40, 62, 12, 38, 25, 5],
  
  // Horizontal Marginal Bar Chart Metrics (Bottom-Left)
  geneAnnotated: [248, 355, 253, 55],
  geneObserved:  [202, 255, 160, 12]
};

export const Default: Story = {
  args: {
    data: mockPayload,
  },
};

export const LargeDataset: Story = {
  args: {
    data: {
      genes: ['GENE_A', 'GENE_B', 'GENE_C', 'GENE_D', 'GENE_E'],
      combinations: [
        ['GENE_A', 'GENE_B', 'GENE_C'],
        ['GENE_B', 'GENE_C', 'GENE_D'],
        ['GENE_A', 'GENE_E'],
        ['GENE_C'],
        ['GENE_A'],
        ['GENE_B']
      ],
      combinationAnnotated: [250, 180, 120, 90, 60, 40],
      combinationObserved:  [190, 130, 40,  85, 55, 15],
      geneAnnotated: [430, 470, 520, 180, 120],
      geneObserved:  [285, 335, 405, 130, 40]
    }
  }
};