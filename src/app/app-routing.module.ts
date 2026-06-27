import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NewPpktComponent } from './newppkt/newppkt.component';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'newppkt', component: NewPpktComponent },
  
  // The wildcard safety net stays at the bottom
  { path: '**', redirectTo: 'home' },
];