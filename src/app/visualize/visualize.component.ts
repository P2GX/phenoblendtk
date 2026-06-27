import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, PhenopacketLoaderComponent } from 'ng-hpo-uikit';
import { invoke } from '@tauri-apps/api/core';
import { ConfigService } from '../services/config-service';

@Component({
  selector: 'app-visualize',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visualize.component.html',
  styleUrls: ['./visualize.component.scss']
})
export class VisualizeComponent {

}