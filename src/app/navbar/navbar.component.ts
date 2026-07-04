import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [RouterLink, RouterLinkActive],
})
export class NavbarComponent implements OnInit{
  tabs = [
    { label: 'Home', path: '/home' },
    { label: 'Load phenopacket', path: '/newppkt' },
    { label: 'HPO text mining', path: '/hpotwostep' },
    { label: 'Visualize', path: '/visualize'}
  ];

  ngOnInit() {
    console.log('✅ NavbarComponent has initialized successfully!');
  }

  isDisabled(tab: { path: string }) {
    console.log("Add is disabled logic if needed");
    return false; 
  }
  logClick(path: string) {
    console.log(`Link clicked for target path: ${path}`);
  }

}

