import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NewCaseComponent } from './newppkt/newppkt.component';
import { PhenotypeProfileVisualizerComponent } from './visualize/visualize.component';
import { HpoTwostepComponent } from './util/hpotwostep/hpotwostep.component';
import { GeneDiseaseComponent } from './util/genedisease/genedisease.component';


export const appRoutes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'newppkt', component: NewCaseComponent },
  { path: 'visualize', component: PhenotypeProfileVisualizerComponent },
  { path: 'genedisease', component: GeneDiseaseComponent },
  
  
  // The wildcard safety net stays at the bottom
  { path: '**', redirectTo: 'home' },
];