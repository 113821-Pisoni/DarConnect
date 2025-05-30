// src/app/components/sidebar/sidebar.component.ts
import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals - Empieza expandido
  isCollapsed = signal(false);
  currentRole = signal<string>('CHOFER'); // Por defecto CHOFER

  // Computed - Menú items según el rol
  menuItems = computed(() => {
  const role = this.currentRole();
  
  if (role === 'CHOFER') {
    return [
      {
        section: 'Principal',
        items: [
          { icon: 'bi-truck', label: 'Mis Traslados', route: '/chofer/mis-traslados' },
          { icon: 'bi-calendar3', label: 'Agenda', route: '/chofer/agenda' },
          { icon: 'bi-graph-up', label: 'Estadísticas', route: '/chofer/estadisticas' }
        ]
      }
    ];
    } else {
      return [
        {
          section: 'Principal',
          items: [
            { icon: 'bi bi-calendar-week', label: 'Traslados del Día', route: '/admin/traslados-dia' },
            { icon: 'bi-speedometer2', label: 'Dashboard', route: '/admin/dashboard' }
          ]
        },
        {
          section: 'Gestión',
          items: [
            { icon: 'bi-people', label: 'Usuarios', route: '/admin/usuarios' },
            { icon: 'bi-person-badge', label: 'Choferes', route: '/admin/choferes' },
            { icon: 'bi-person-heart', label: 'Pacientes', route: '/admin/pacientes' },
            { icon: 'bi bi-hospital', label: 'Obras Sociales', route: '/admin/obras-sociales' },
            { icon: 'bi bi-calendar-plus', label: 'Agendas', route: '/admin/agenda' },
            { icon: 'bi bi-truck', label: 'Traslados', route: '/admin/traslados' }
            // Aquí irán Choferes, Pacientes, Agendas...
          ]
        },
        {
          section: 'Reportes',
          items: [
            // Aquí irán los reportes cuando los hagamos
          ]
        }
      ];
    }
  });

  constructor() {
    // Obtener rol actual del usuario
    const user = this.authService.currentUserValue;
    if (user) {
      this.currentRole.set(user.role);
    }

    // Suscribirse a cambios del usuario
    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.currentRole.set(user.role);
      }
    });
  }

  toggleSidebar() {
    this.isCollapsed.update(value => !value);
  }

  // Control de demo (eliminar en producción)
  toggleRole() {
    const newRole = this.currentRole() === 'CHOFER' ? 'ADMINISTRADOR' : 'CHOFER';
    this.currentRole.set(newRole);
  }
}