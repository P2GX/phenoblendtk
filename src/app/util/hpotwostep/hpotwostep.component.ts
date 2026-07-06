import { Component, HostListener, inject, input, OnDestroy, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { HierarchyMapItem, HpoTermMinimal, OntologyMatch, PolishedHpoAnnotation } from 'ng-hpo-uikit';
import { HpoMiningComponent } from 'ng-hpo-uikit';
import { NotificationService } from 'ng-hpo-uikit';
import { HpoPolishingWorkspaceComponent } from 'ng-hpo-uikit';
import { FenominalSentence } from 'ng-hpo-uikit';
import { Observable } from 'rxjs/internal/Observable';



export interface HpoTwostepData {
  mineTextProvider: (text: string) => Promise<FenominalSentence[]>;
  hierarchyProvider: (termId: string) => Promise<HierarchyMapItem>;
  availableModifiers: () => Promise<HpoTermMinimal[]>;
  autocompleteProvider: (query: string) => Observable<OntologyMatch[]>;
}

@Component({
  selector: 'app-hpo-twostep',
  standalone: true,
  imports: [
    HpoMiningComponent,
    HpoPolishingWorkspaceComponent,
    MatIcon
  ],
  templateUrl: './hpotwostep.component.html',
  styleUrl: './hpotwostep.component.scss'
})
export class HpoTwostepComponent implements OnDestroy {
  protected readonly dialogRef = inject(MatDialogRef<HpoTwostepComponent>);
  private readonly notificationService = inject(NotificationService);
  // High-performance declarative state tracking
  protected currentStep = signal<1 | 2>(1);
  protected curatedSentences = signal<FenominalSentence[]>([]);
  private readonly dialogData = inject<HpoTwostepData>(MAT_DIALOG_DATA);
  protected readonly mineTextProvider = this.dialogData.mineTextProvider; 
  protected readonly hierarchyProvider = this.dialogData.hierarchyProvider;
  protected readonly autocompleteProvider = this.dialogData.autocompleteProvider;


  protected readonly availableModifiers = signal<HpoTermMinimal[]>([]);

  constructor() {
    this.dialogData.availableModifiers()
      .then(modifiers => this.availableModifiers.set(modifiers))
      .catch(err => this.notificationService.showError(`Failed to load modifiers: ${err}`));
  }


  ngOnDestroy(): void {
    console.trace("HpoTwostepComponent destroyed.");
  }

  /**
   * Step 1 Callback: Ingests raw text annotations from the parser engine,
   * converts them to your structured workspace sentences, and steps forward.
   */
  protected handleMiningRequest(event: { text: string; callback: (result: FenominalSentence[] | string) => void }): void {
    this.mineTextProvider(event.text)
      .then((sentences) => event.callback(sentences))
      .catch((error: any) => event.callback(error?.message || 'Text mining execution failed.'));
  }
  

  protected onTextMiningSuccess(parsedSentences: FenominalSentence[]): void {
    this.notificationService.showSuccess(`Parsed sentences: n=${parsedSentences.length}` );
    parsedSentences.forEach(s => { console.log("xyz"); console.log(s);
      
    });
    this.curatedSentences.set(parsedSentences);
    console.log(`We got ${this.curatedSentences().length} curated sentences`)
    this.currentStep.set(2);
  }

  protected onTextMiningError(message: string): void {
    this.notificationService.showError(`Ontology text mining parsing pipeline failed: ${message}.`);
  }

  /**
   * Step 2 Callback: Ingests final curated tokens to return to the backend database
   */
  protected onCurationComplete(finalSentences: PolishedHpoAnnotation[]): void {
    // Extract out just the final validated modifications to persist
    console.log("output");
    this.dialogRef.close(finalSentences);  
  }



  @HostListener('document:keydown.escape')
  protected onKeydownHandler(): void {
    this.close();
  }

  protected close(): void {
    this.dialogRef.close();
  }

}