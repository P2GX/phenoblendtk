import { Component } from '@angular/core';
import { FooterComponent } from 'ng-hpo-uikit';
import { RouterOutlet } from '@angular/router';
import { open as openExternalBrowser } from '@tauri-apps/plugin-shell';


@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', '../styles.scss'],
  imports: [
    FooterComponent,
    RouterOutlet,

]
})
export class AppComponent {





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
