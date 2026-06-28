import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, PhenopacketLoaderComponent } from 'ng-hpo-uikit';
import { invoke } from '@tauri-apps/api/core';
import { ConfigService } from '../services/config-service';

@Component({
  selector: 'app-new-case',
  standalone: true,
  imports: [CommonModule, PhenopacketLoaderComponent],
  templateUrl: './newppkt.component.html',
  styleUrls: ['./newppkt.component.scss']
})
export class NewPpktComponent {
  readonly isProcessing = signal<boolean>(false);
  readonly statusMessage = signal<string | null>(null);
  readonly errorDetails = signal<string | null>(null);
  readonly activeCaseId = signal<string | null>(null);

  private configService = inject(ConfigService);
  private notificationService = inject(NotificationService);

  /**
   * The explicit callback handler passed down to the library loader.
   * Defined as an arrow function to lock contextual execution scope execution bounds to this class.
   */
  readonly processPhenopacketIngest = async (payload: string): Promise<void> => {
    // Reset state states before starting ingest processing
    this.isProcessing.set(true);
    this.statusMessage.set('Parsing phenopacket payload in Rust engine...');
    this.errorDetails.set(null);
    console.log("processPhenopacketIngest - payload", payload);
    try { 
      this.configService.ingestPhenopacket(payload);
      this.notificationService.showSuccess('Phenopacket ingested successfully.'); 
    } catch (error) {
      this.notificationService.showError('Ingestion failed.');
    } finally {
      this.isProcessing.set(false);
    }
  };
}