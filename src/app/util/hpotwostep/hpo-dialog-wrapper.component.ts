import {
  Component,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
  afterNextRender,
} from '@angular/core';
import { HpoTwostepMiningComponent, NotificationService, HpoTwostepData, PolishedHpoAnnotation } from 'ng-hpo-uikit';

@Component({
  selector: 'app-hpo-dialog-wrapper',
  standalone: true,
  imports: [HpoTwostepMiningComponent],
  template: `
    <dialog #dialogEl class="hpo-mining-dialog" (close)="onNativeClose()">
      <lib-hpo-twostep-mining
        [config]="dialogData()"
        (curationComplete)="onComplete($event)"
        (cancelled)="onCancelled()"
        (errorOccurred)="handleError($event)">
      </lib-hpo-twostep-mining>
    </dialog>
  `,
  styleUrl: './hpo-dialog-wrapper.component.scss',
})
export class HpoDialogWrapperComponent {
  readonly dialogData = input.required<HpoTwostepData>();
  readonly result = output<PolishedHpoAnnotation[] | undefined>();

  private readonly notificationService = inject(NotificationService);
  private readonly dialogEl = viewChild.required<ElementRef<HTMLDialogElement>>('dialogEl');
  private closedByUs = false;

  constructor() {
    afterNextRender(() => this.dialogEl().nativeElement.showModal());
  }

  onComplete(data: PolishedHpoAnnotation[]) {
    this.closedByUs = true;
    this.result.emit(data);
    this.dialogEl().nativeElement.close();
  }

  onCancelled() {
    this.closedByUs = true;
    this.result.emit(undefined);
    this.dialogEl().nativeElement.close();
  }

  /** Catches Esc-key / backdrop dismissal that bypasses onComplete/onCancelled */
  onNativeClose() {
    if (!this.closedByUs) {
      this.result.emit(undefined);
    }
  }

  handleError(msg: string) {
    this.notificationService.showError(msg);
  }
}