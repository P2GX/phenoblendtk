import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NewPpktComponent } from './newppkt/newppkt.component';
import { PresenceVisualizerComponent } from './visualize/visualize.component';
import { HpoTwostepComponent } from './util/hpotwostep/hpotwostep.component';
import { GeneDiseaseComponent } from './util/genedisease/genedisease.component';


export const appRoutes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'newppkt', component: NewPpktComponent },
  { path: 'visualize', component: PresenceVisualizerComponent },
  { path: 'genedisease', component: GeneDiseaseComponent },
  
  
  // The wildcard safety net stays at the bottom
  { path: '**', redirectTo: 'home' },
];