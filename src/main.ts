// src/main.ts
import { bootstrapApplication } from "@angular/platform-browser";
import { importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { AppComponent } from "./app/app.component";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app/app-routing.module'

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),provideRouter(appRoutes), 
    importProvidersFrom(
      BrowserAnimationsModule,
      ReactiveFormsModule,
    ),
  ],
}).then(() => {
  setTimeout(() => {
    (window as any).__TAURI__?.webviewWindow?.getCurrent()?.openDevtools?.();
  }, 300);
}).catch(err => console.error(err));
