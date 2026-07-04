import { Injectable, signal, inject, NgZone, computed } from '@angular/core';
import { listen } from '@tauri-apps/api/event';
import { StatusDto, defaultStatusDto } from '../models/status_dto';
import { invoke } from '@tauri-apps/api/core';
import { ask } from '@tauri-apps/plugin-dialog';
import { getCurrentWindow } from "@tauri-apps/api/window";
import { NotificationService } from 'ng-hpo-uikit';
import { WritableSignal } from '@angular/core';
import { InitializationStatusDto } from '../models/status_dto'; 

// Corresponds to OntologyLoadEvent in ga4ghphetools
interface OntologyLoadEvent {
    status: 'loading' | 'success' | 'error' | 'cancel';
    payload?: {
      statusMessage?: string;
      termCount?: number;
      errorMessage?: string;
    };
  }


@Injectable({ providedIn: 'root' })
export class AppStatusService {

  private ngZone = inject(NgZone);
  private notificationService = inject(NotificationService);

  hpoLoaded = signal<boolean>(false);
  hpoaLoaded = signal<boolean>(false);
  g2dLoaded = signal<boolean>(false);
  hpoVersion = signal<string>('');
  hpoaVersion = signal<string>('');
  g2dVersion = signal<string>('');
  hpoJsonPath = signal<string>('');
  nHpoTerms = signal<number>(0);
  nHpoaDisease = signal<number>(0);
  hpoLoading = signal<boolean>(false);
  hpoaLoading = signal<boolean>(false);
  g2dLoading = signal<boolean>(false);
  nGenes = signal<number>(0);
  biocuratorOrcid = signal<string>('');
  errorMessage = signal<string>('');
  hasError = computed(() => !!this.errorMessage());

    constructor() {
      this.setupListeners().then(() => {
        this.fetchPreloadedStatus();
      });
    }




 private async setupListeners() {
    // Bind the HPO Stream
    await this.registerOntologyListener({
      channel: 'hpo-load-event',
      loadingSignal: this.hpoLoading,
      loadedSignal: this.hpoLoaded,
      versionSignal: this.hpoVersion,
      countSignal: this.nHpoTerms,
      errorContext: 'HPO'
    });

    // Bind the HPOA Stream 
    await this.registerOntologyListener({
      channel: 'hpoa-load-event',
      loadingSignal: this.hpoaLoading,
      loadedSignal: this.hpoaLoaded,
      versionSignal: this.hpoaVersion,
      countSignal: this.nHpoaDisease,
      errorContext: 'HPOA'
    });

    await this.registerOntologyListener({
      channel: 'g2d-load-event',
      loadingSignal: this.g2dLoading,
      loadedSignal: this.g2dLoaded,
      versionSignal: this.g2dVersion,
      countSignal: this.nGenes,
      errorContext: 'gene-to-disease'
    });
  }



/**
 * Registers a generic Tauri event listener for ontology loading (HPO or MAxO)
 */
private async registerOntologyListener(config: {
  channel: string;
  loadingSignal: WritableSignal<boolean>;
  loadedSignal: WritableSignal<boolean>;
  versionSignal: WritableSignal<string>;
  countSignal: WritableSignal<number>;
  errorContext: string;
}) {
 
  await listen(config.channel, (event) => {
    const { status, payload } = event.payload as OntologyLoadEvent;

    this.ngZone.run(() => {
      switch (status) {
        case 'loading':
          config.loadingSignal.set(true);
          this.errorMessage.set('');
          break;

        case 'success':
          config.loadingSignal.set(false);
          config.loadedSignal.set(true);
          const versionInfo = payload?.statusMessage || 'Loaded';
          const totalTerms = payload?.termCount ?? 0;
          config.countSignal.set(totalTerms);
          config.versionSignal.set(versionInfo);
          break;

        case 'error':
          config.loadingSignal.set(false);
          const errorMsg = typeof payload === 'object' ? payload?.errorMessage : payload;
          this.errorMessage.set(`[${config.errorContext}] ${errorMsg || 'Failed to parse'}`);
          this.notificationService.showError(this.errorMessage());
          break;

        case 'cancel':
          config.loadingSignal.set(false);
          break;
      }
    });
  });
}

  private async fetchPreloadedStatus() {
    try {
      const status = await invoke<InitializationStatusDto>('check_initialization_status');
      
      this.ngZone.run(() => {
        this.hpoLoaded.set(status.hpo_loaded);
        this.nHpoTerms.set(status.hpo_terms);
        if (status.hpo_loaded) this.hpoVersion.set('Preloaded from Settings');

        this.hpoaLoaded.set(status.hpoa_loaded);
        this.nHpoaDisease.set(status.hpoa_diseases);
        if (status.hpoa_loaded) this.hpoaVersion.set('Preloaded from Settings');

        this.g2dLoaded.set(status.g2d_loaded);
        this.nGenes.set(status.n_genes);
        if (status.g2d_loaded) this.g2dVersion.set('Preloaded from Settings');
      });
    } catch (err: any) {
      console.error('Failed to resolve initial backend pre-load state context:', err);
    }
  }
    

}