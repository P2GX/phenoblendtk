import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NewPpktComponent } from './newppkt/newppkt.component';
import { PresenceVisualizerComponent } from './visualize/visualize.component';
import { HpoTwostepComponent } from './util/hpotwostep/hpotwostep.component';


export const appRoutes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'newppkt', component: NewPpktComponent },
  { path: 'visualize', component: PresenceVisualizerComponent },
  { path: 'hpotwostep', component: NewPpktComponent },
  
  
  // The wildcard safety net stays at the bottom
  { path: '**', redirectTo: 'home' },
];