// spread-plot.stories.ts
import { Meta, StoryObj } from '@storybook/angular';
import { SpreadPlotComponent } from './spread-plot.component';
import { SpreadPlotPayload } from '../models/phenoprofile_dto';

const meta: Meta<SpreadPlotComponent> = {
  title: 'Components/SpreadPlot',
  component: SpreadPlotComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<SpreadPlotComponent>;

// Structured mock data representing typical top-level HPO category weights
const mockPayload: SpreadPlotPayload = {
  seriesLabels: ['Ppkt', 'MBNL1', 'DMPK', 'MBNL1+DMPK'],
  categories: [
    {
      id: 'HP:0000707',
      name: 'Nervous system',
      ppktValue: 0.45,
      geneValues: [0.35, 0.50, 0.42]
    },
    {
      id: 'HP:0001626',
      name: 'Cardiovascular',
      ppktValue: 0.30,
      geneValues: [0.12, 0.40, 0.35]
    },
    {
      id: 'HP:0033127',
      name: 'Musculoskeletal',
      ppktValue: 0.25,
      geneValues: [0.55, 0.20, 0.38]
    },
    {
      id: 'HP:0000478',
      name: 'Eye',
      ppktValue: 0.15,
      geneValues: [0.22, 0.10, 0.18]
    },
    {
      id: 'HP:0000119',
      name: 'Genitourinary',
      ppktValue: 0.00,
      geneValues: [0.05, 0.08, 0.06]
    },
    {
      id: 'HP:0001507',
      name: 'Growth',
      ppktValue: 0.20,
      geneValues: [0.00, 0.15, 0.10]
    }
  ]
};

export const Default: Story = {
  args: {
    data: mockPayload,
  },
};

export const HighlySkewedProfile: Story = {
  args: {
    data: {
      seriesLabels: ['Ppkt', 'FXN'],
      categories: [
        {
          id: 'HP:0000707',
          name: 'Nervous system',
          ppktValue: 0.85,
          geneValues: [0.75]
        },
        {
          id: 'HP:0001626',
          name: 'Cardiovascular',
          ppktValue: 0.40,
          geneValues: [0.60]
        },
        {
          id: 'HP:0033127',
          name: 'Musculoskeletal',
          ppktValue: 0.05,
          geneValues: [0.10]
        },
        {
          id: 'HP:0025142',
          name: 'Constitutional',
          ppktValue: 0.20,
          geneValues: [0.05]
        }
      ]
    }
  }
};