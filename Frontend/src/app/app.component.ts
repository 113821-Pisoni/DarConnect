// src/app/app.component.ts
import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  title = 'darconnect-frontend';
  
  // Signal para la URL actual
  currentUrl = signal<string>('');

  // Computed para determinar si mostrar el layout
  showLayout = computed(() => {
    const url = this.currentUrl();
    const isAuthenticated = this.authService.isAuthenticated();
    
    // No mostrar layout en rutas de auth
    const isAuthRoute = url.includes('/auth/');
    
    return isAuthenticated && !isAuthRoute;
  });

  constructor() {
    // Escuchar cambios de ruta
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl.set(event.urlAfterRedirects);
      });

    // Establecer URL inicial
    this.currentUrl.set(this.router.url);
  }
}