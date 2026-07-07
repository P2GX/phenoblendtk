import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from 'ng-hpo-uikit';
import { RouterOutlet } from '@angular/router';
import { open as openExternalBrowser } from '@tauri-apps/plugin-shell';
import { getCurrentWindow } from '@tauri-apps/api/window';


@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', '../styles.scss'],
  imports: [
    FooterComponent,
    NavbarComponent,
    RouterOutlet,

]
})
export class AppComponent implements OnInit {

  async ngOnInit() {
      const appWindow = getCurrentWindow();
      
      // Listen for the event emitted by Rust backend
      await appWindow.listen('close-requested', async () => {
        // 1. Optional: Add an unsaved changes check here if needed
        // 2. Destroy the window cleanly from the frontend
        await appWindow.destroy();
      });
    }
  
  handleHelpNavigation() {
    this.handleExternalNavigation("https://github.com/P2GX/phenoblendtk");
  }


  private async handleExternalNavigation(url: string): Promise<void> {
    try {
      await openExternalBrowser(url);
    } catch (error) {
      console.warn('Tauri environment missing, falling back to standard web navigation.', error);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }
}
