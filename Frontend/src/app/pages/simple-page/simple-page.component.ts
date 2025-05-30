import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-simple-page',
  standalone: true,
  template: `
    <div class="container-fluid p-4">
      <div class="card">
        <div class="card-body">
          <h2>{{getPageTitle()}}</h2>
          <p>Esta es una página temporal para probar la navegación del sidebar.</p>
          <hr>
          <p class="text-muted">URL actual: {{getCurrentUrl()}}</p>
        </div>
      </div>
    </div>
  `
})
export class SimplePageComponent {
  constructor(private route: ActivatedRoute) {}

  getPageTitle(): string {
    const url = window.location.pathname;
    switch(url) {
      case '/mis-traslados': return 'Mis Traslados';
      case '/agenda': return 'Agenda Semanal';
      case '/estadisticas': return 'Estadísticas';
      case '/dashboard': return 'Dashboard Admin';
      default: return 'Página';
    }
  }

  getCurrentUrl(): string {
    return window.location.pathname;
  }
}