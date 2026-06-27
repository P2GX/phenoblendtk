import { Injectable } from '@angular/core';
import { invoke } from "@tauri-apps/api/core";
import { StatusDto } from '../models/status_dto';
import { ask } from '@tauri-apps/plugin-dialog';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
 

  async loadHPO(): Promise<void> {
    return await invoke("load_hpo");
  }

  async loadHpoas(): Promise<void> {
    return await invoke("load_hpoas");
  }

  async loadGeneToDisease(): Promise<void> {
    return await invoke("load_gene_disease_associations");
  }

  async ingestPhenopacket(ppkt: string): Promise<void> {
    return await invoke("ingest_phenopacket", {'ppkt': ppkt});
  }


}