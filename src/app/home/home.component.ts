import { Component, computed, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';
import { LoadOntologyComponent, NotificationService } from 'ng-hpo-uikit';

import { FormsModule } from '@angular/forms';


import { AppStatusService } from '../services/app-status-service';
import { ConfigService } from '../services/config-service';



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadOntologyComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {


  private router= inject(Router);
  private notificationService = inject(NotificationService);
  public statusService = inject(AppStatusService);
  private configService = inject(ConfigService);
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
      const cancel = this.cancelMessage();
      const status = this.statusService;
      if (status.g2dLoaded()) {
        return "g2d file loaded";
      } else if (status.g2dLoading()) {
        return "loading g2d file";
      } else if (cancel) {
        return cancel;
      }
      return "uninitialized"
    });
 
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
    console.log("loadGeneToDisease");
    console.log("before await");

    try {
      await this.configService.loadGeneToDisease();

      console.log("after await");

      this.notificationService.showSuccess("Loaded gene-to-disease file");
    } catch (error) {
      console.error("Caught error:", error);

      this.notificationService.showError(
        `Failed to load Gene to Disease file: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    console.log("function finished");
  }




}
