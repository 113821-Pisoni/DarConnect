// src/app/components/navbar/navbar.component.ts
import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ChoferService } from '../../services/chofer.service';
import { LoginResponse } from '../../interfaces/auth.interface';
import { ChoferData } from '../../interfaces/chofer.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private choferService = inject(ChoferService);
  private router = inject(Router);

  // Signals
  currentUser = signal<LoginResponse | null>(null);
  currentChofer = signal<ChoferData | null>(null);
  isDropdownOpen = signal(false);
  isLoading = signal(true);

  // Computed signals
  displayName = computed(() => {
    if (this.isLoading()) return 'Cargando...';
    
    const user = this.currentUser();
    const chofer = this.currentChofer();
    
    if (user?.role === 'CHOFER' && chofer) {
      return `${chofer.nombre} ${chofer.apellido}`;
    }
    
    return user?.username || 'Usuario';
  });

  displayRole = computed(() => {
    const user = this.currentUser();
    return user?.role === 'CHOFER' ? 'Chofer' : 'Administrador';
  });

  avatarInitials = computed(() => {
    if (this.isLoading()) return 'U';
    
    const user = this.currentUser();
    const chofer = this.currentChofer();
    
    if (user?.role === 'CHOFER' && chofer) {
      return `${chofer.nombre.charAt(0)}${chofer.apellido.charAt(0)}`;
    }
    
    return user?.username.charAt(0).toUpperCase() || 'U';
  });

  ngOnInit() {
    // Obtener usuario actual
    const user = this.authService.currentUserValue;
    this.currentUser.set(user);
    
    // Si es chofer, cargar sus datos
    if (user && user.role === 'CHOFER') {
      this.loadChoferData();
    } else {
      this.isLoading.set(false);
    }

    // Suscribirse a cambios del usuario (para logout/login)
    this.authService.currentUser.subscribe(user => {
      this.currentUser.set(user);
      if (user && user.role === 'CHOFER') {
        this.loadChoferData();
      } else {
        this.isLoading.set(false);
        this.currentChofer.set(null);
      }
    });
  }

  private loadChoferData() {
    this.isLoading.set(true);
    this.choferService.getCurrentChofer().subscribe({
      next: (chofer) => {
        this.currentChofer.set(chofer);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando datos del chofer:', error);
        this.isLoading.set(false);
      }
    });
  }

  toggleDropdown() {
    this.isDropdownOpen.update(value => !value);
  }

  closeDropdown() {
    this.isDropdownOpen.set(false);
  }

  goToProfile() {
    this.closeDropdown();
    // TODO: Navegar a página de perfil
    console.log('Ir a perfil');
  }

  goToSettings() {
    this.closeDropdown();
    // TODO: Navegar a configuración
    console.log('Ir a configuración');
  }

  logout() {
    this.closeDropdown();
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}