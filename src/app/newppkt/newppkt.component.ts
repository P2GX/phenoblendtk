import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FenominalSentence, NotificationService, OntologyMatch, PhenopacketLoaderComponent } from 'ng-hpo-uikit';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { from, Observable } from 'rxjs';
import { ConfigService } from '../services/config-service';
import { HpoTwostepComponent } from '../util/hpotwostep/hpotwostep.component';


export interface FenominalMiningInterface {
  searchProvider: (query: string) => Observable<OntologyMatch[]>;
  mineTextProvider: (text: string) => Promise<FenominalSentence[]>; // Add this
}

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
  private dialog = inject(MatDialog);
  

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

  /**
 * The search provider implementation matching the signature expected by HpoTwostepComponent.
 * Converts the Tauri Promise into an RxJS Observable using 'from'.
 */
  private readonly hpoSearchProvider = (query: string): Observable<OntologyMatch[]> => {
    // If the query is less than 3 characters, short-circuit immediately to save a IPC roundtrip
    if (!query || query.trim().length < 3) {
      return from(Promise.resolve([]));
    }
    
    return from(this.configService.getAutocompleteHpo(query));
  };

 

  protected openCurationWizard(): void {
    const dialogRef = this.dialog.open(HpoTwostepComponent, {
      width: '85vw',
      maxWidth: '1200px',
      height: '80vh',
      disableClose: true,
      data: {
        mineTextProvider: (text: string) => this.configService.mineClinicalText(text),
        searchProvider: this.hpoSearchProvider
      }
    });


    // Capture the final optimized array of PolishedHpoAnnotation objects on close
    dialogRef.afterClosed().subscribe((polishedAnnotations) => {
      if (polishedAnnotations) {
        console.log('Received curated HPO annotations:', polishedAnnotations);
        const observedTerms = polishedAnnotations.filter((annot: { isObserved: any; }) => annot.isObserved);
        console.log('Observed terms from text mining:', observedTerms);
        
        this.proceedToNextWindow(observedTerms);
      }
    });
  }

  private proceedToNextWindow(observedTerms: any[]): void {
    this.notificationService.showSuccess("TODO implement proceed to next")
  }
}