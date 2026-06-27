import { Component, computed, inject, NgZone, OnInit, signal } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { OrcidDialogComponent, NotificationService } from 'ng-hpo-uikit';
import { LoadOntologyComponent } from 'ng-hpo-uikit';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox'
import { openUrl } from '@tauri-apps/plugin-opener';
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppStatusService } from '../services/app-status-service';
import { ConfigService } from '../services/config-service';



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, FormsModule, LoadOntologyComponent, 
    MatCheckboxModule, MatIcon, MatProgressSpinnerModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {



  private router= inject(Router);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);
  public statusService = inject(AppStatusService);
  private configService = inject(ConfigService);

  private ngZone = inject(NgZone);
  private cancelMessage = signal<string | null>(null);



  hpoMessage = computed(() => {
    const cancel = this.cancelMessage();
    const status = this.statusService;
    if (status.hpoLoaded()) {
      const version = status.hpoVersion();
      const count = status.nHpoTerms();
      return version && count ? `${version} (${count})` : 'Loaded';
    } else if (status.hpoLoading()) {
      return "Loading hp.json ...";
    } else if (cancel) return cancel;
    return "uninitialized";
  });

    hpoaMessage = computed(() => {
      const cancel = this.cancelMessage();
      const status = this.statusService;
      if (status.hpoaLoaded()) {
        const version = status.hpoaVersion();
        const count = status.nHpoaDisease();
        return version && count ? `${version} (${count})` : 'Loaded';
      } else if (status.hpoaLoading()) {
        return "Loading phenotype.hpoa ...";
      } else if (cancel) return cancel;
      return "uninitialized";
    });

    g2dMessage = computed(() => {
      return "G2D message (to do)"
    })
 
  data = "?";

  progressValue = 0;
  isRunning = false;

 
 
    biocuratorOrcid = signal("na");

    async loadHpo(): Promise<void> {
      try {
        await this.configService.loadHPO();
      } catch (error: unknown) {
        this.notificationService.showError(
          `Failed to load HPO: ${error instanceof Error ? error.message : error}`
        );
      } 
    }

    async loadHpoas(): Promise<void> {
      try {
        await this.configService.loadHpoas();
      } catch (error: unknown) {
        this.notificationService.showError(
          `Failed to load HPOAs: ${error instanceof Error ? error.message : error}`
        );
      } 
    }

     async loadGeneToDisease(): Promise<void> {
      console.log("loadGeneToDisease")
      try {
        await this.configService.loadGeneToDisease();
        this.notificationService.showSuccess("Loaded gene-to-disease file");
      } catch (error: unknown) {
        this.notificationService.showError(
          `Failed to load Gene to Disease file: ${error instanceof Error ? error.message : error}`
        );
      } 
    }

  



  setBiocuratorOrcid(): void {
    const dialogRef = this.dialog.open(OrcidDialogComponent, {
      width: '500px',
      disableClose: true, 
      data: { 
        currentOrcid: this.biocuratorOrcid()
      }
    });

    // this subscribes to the @output/emit of the dialog and opens
    // the ORCID website in the system browser
    dialogRef.componentInstance.externalLinkClicked.subscribe((url: string) => {
      this.handleExternalNavigation(url);
    });

    dialogRef.afterClosed().subscribe((result: string | undefined) => {
      if (!result) {
        this.notificationService.showWarning("Unable to set the curator ORCID.");
        return;
      }

      this.biocuratorOrcid.set(result);
      this.notificationService.showSuccess(`Set curator ORCID to ${result}.`);
    });
  }

  // launch the link in the user's default browser
  private async handleExternalNavigation(url: string): Promise<void> {
    await openUrl(url);
  }




}
