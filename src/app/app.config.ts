// app.config.ts
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from "@angular/core";
import { provideRouter, withDebugTracing } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { appRoutes } from './app-routing.module';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes, withDebugTracing()), // Tracing is now enabled!
    importProvidersFrom(
      BrowserAnimationsModule,
      MatMenuModule,
      MatButtonModule,
      ReactiveFormsModule,
    ),
  ],
};