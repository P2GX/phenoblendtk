// main.ts
import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { appConfig } from "./app.config"; // Path to your app.config.ts file

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    // Keep your nice Tauri devtools auto-open hook!
    setTimeout(() => {
      (window as any).__TAURI__?.webviewWindow?.getCurrent()?.openDevtools?.();
    }, 300);
  })
  .catch(err => console.error(err));