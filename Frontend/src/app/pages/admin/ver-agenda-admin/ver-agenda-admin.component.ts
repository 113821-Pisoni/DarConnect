// ver-agenda-admin.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChoferService } from '../../../services/chofer.service';
import { ChoferData } from '../../../interfaces/chofer.interface';
import { AgendaComponent } from '../../chofer/agenda/agenda.component';

@Component({
  selector: 'app-ver-agenda-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, AgendaComponent],
  templateUrl: './ver-agenda-admin.component.html',
  styleUrls: ['./ver-agenda-admin.component.css']
})
export class VerAgendaAdminComponent implements OnInit {
  
  choferes = signal<ChoferData[]>([]);
  choferSeleccionado = signal<number | undefined>(undefined);
  loadingChoferes = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor(private choferService: ChoferService) {}

  ngOnInit(): void {
    this.cargarChoferes();
  }

  private cargarChoferes(): void {
    this.loadingChoferes.set(true);
    this.error.set(null);

    this.choferService.getAllChoferes().subscribe({
      next: (choferes) => {
        
        // Filtrar choferes activos (activo === true O activo === undefined)
        const choferesActivos = choferes.filter(chofer => chofer.activo !== false);
        
        this.choferes.set(choferesActivos);
        this.loadingChoferes.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar la lista de choferes');
        this.loadingChoferes.set(false);
        console.error('Error cargando choferes:', err);
      }
    });
  }

  onChoferSeleccionado(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const choferId = target.value ? parseInt(target.value) : undefined;
    this.choferSeleccionado.set(choferId);
  }

  // Obtener el nombre del chofer seleccionado
  getNombreChoferSeleccionado(): string {
    const choferId = this.choferSeleccionado();
    if (!choferId) return '';
    
    const chofer = this.choferes().find(c => c.id === choferId);
    return chofer ? `${chofer.nombre} ${chofer.apellido}` : '';
  }
}