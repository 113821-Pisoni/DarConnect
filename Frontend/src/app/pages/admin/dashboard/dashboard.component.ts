// admin-dashboard.component.ts
import { Component, OnInit, ViewChild, ElementRef, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { AdminDashboardService } from '../../../services/admin-dashboard.service';
import { PacientesService } from '../../../services/pacientes.service';
import { ObrasSocialesService } from '../../../services/obras-sociales.service';
import { Paciente } from '../../../interfaces/paciente.interface';
import { ObraSocial } from '../../../interfaces/obraSocial.interface';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('rendimientoChart', { static: false }) rendimientoChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('obrasSocialesChart', { static: false }) obrasSocialesChart!: ElementRef<HTMLCanvasElement>;

  // Signals
  loading = signal<boolean>(false);
  error = signal<string>('');
  periodo = signal<string>('semana');
  
  // Datos
  estadisticasGlobales = signal<any>(null);
  estadisticasChoferes = signal<any[]>([]);
  pacientes = signal<Paciente[]>([]);
  obrasSociales = signal<ObraSocial[]>([]);

  // Charts
  private chartRendimiento?: Chart;
  private chartObrasSociales?: Chart;

  // Computed
  metricasGenerales = computed(() => {
    const stats = this.estadisticasGlobales();
    if (!stats) return [];

    return [
      {
        titulo: 'Total Choferes',
        valor: stats.totalChoferes,
        valorSecundario: `${stats.choferesActivos} activos`,
        icono: 'bi-person-badge',
        color: 'primary'
      },
      {
        titulo: 'Total Pacientes',
        valor: stats.totalPacientes,
        valorSecundario: `${stats.pacientesActivos} activos`,
        icono: 'bi-people',
        color: 'success'
      },
      {
        titulo: 'Obras Sociales',
        valor: stats.totalObrasSociales,
        valorSecundario: `${stats.obrasSocialesActivas} activas`,
        icono: 'bi-heart-pulse',
        color: 'info'
      },
      {
        titulo: 'Traslados Hoy',
        valor: stats.trasladosHoy,
        valorSecundario: 'En el día',
        icono: 'bi-car-front',
        color: 'warning'
      }
    ];
  });

  topChoferes = computed(() => {
    const choferes = this.estadisticasChoferes();
    if (!choferes.length) return [];

    return choferes
      .sort((a, b) => b.finalizados - a.finalizados)
      .slice(0, 5)
      .map(chofer => ({
        ...chofer,
        porcentajeExito: chofer.finalizados + chofer.cancelados > 0 
          ? Math.round((chofer.finalizados / (chofer.finalizados + chofer.cancelados)) * 100)
          : 0
      }));
  });

  // Computed para agrupar pacientes por obra social
  pacientesPorObraSocial = computed(() => {
    const pacientes = this.pacientes();
    const obrasSociales = this.obrasSociales();
    
    if (!pacientes.length || !obrasSociales.length) return [];

    // Agrupar pacientes por obra social
    const grupos = new Map<number, { obraSocial: ObraSocial, cantidadPacientes: number }>();
    
    pacientes.forEach(paciente => {
      if (paciente.idObraSocial) {
        const actual = grupos.get(paciente.idObraSocial) || { 
          obraSocial: obrasSociales.find(os => os.id === paciente.idObraSocial)!,
          cantidadPacientes: 0 
        };
        actual.cantidadPacientes++;
        grupos.set(paciente.idObraSocial, actual);
      }
    });

    // Convertir a array y ordenar por cantidad descendente
    return Array.from(grupos.values())
      .filter(grupo => grupo.obraSocial) // Filtrar obras sociales no encontradas
      .sort((a, b) => b.cantidadPacientes - a.cantidadPacientes)
      .slice(0, 6); // Top 6 obras sociales
  });

  constructor(
    private adminService: AdminDashboardService,
    private pacientesService: PacientesService,
    private obrasSocialesService: ObrasSocialesService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.destruirCharts();
  }

  cargarDatos(): void {
    this.loading.set(true);
    this.error.set('');

    // Cargar datos en paralelo
    Promise.all([
      this.cargarDashboardData(),
      this.cargarPacientes(),
      this.cargarObrasSociales()
    ]).then(() => {
      this.loading.set(false);
      setTimeout(() => this.crearGraficos(), 100);
    }).catch((error) => {
      console.error('Error al cargar datos:', error);
      this.error.set('Error al cargar los datos del dashboard');
      this.loading.set(false);
    });
  }

  private cargarDashboardData(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.adminService.getDashboardCompleto(this.periodo()).subscribe({
        next: (data) => {
          this.estadisticasGlobales.set(data.estadisticasGlobales);
          this.estadisticasChoferes.set(data.estadisticasPorChofer.estadisticasChoferes);
          resolve();
        },
        error: (error) => reject(error)
      });
    });
  }

  private cargarPacientes(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.pacientesService.getPacientes().subscribe({
        next: (pacientes) => {
          this.pacientes.set(pacientes);
          resolve();
        },
        error: (error) => reject(error)
      });
    });
  }

  private cargarObrasSociales(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.obrasSocialesService.getObrasSocialesActivas().subscribe({
        next: (obrasSociales) => {
          this.obrasSociales.set(obrasSociales);
          resolve();
        },
        error: (error) => reject(error)
      });
    });
  }

  onPeriodoChange(event: any): void {
    this.periodo.set(event.target.value);
    this.cargarDatos();
  }

  private crearGraficos(): void {
    this.destruirCharts();
    this.crearGraficoRendimiento();
    this.crearGraficoObrasSociales();
  }

  private crearGraficoRendimiento(): void {
    if (!this.rendimientoChart?.nativeElement) return;

    const ctx = this.rendimientoChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const choferes = this.topChoferes();
    if (choferes.length === 0) {
      ctx.fillStyle = '#6c757d';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Sin datos de choferes', ctx.canvas.width / 2, ctx.canvas.height / 2);
      return;
    }

    const labels = choferes.map(c => c.nombreCompleto.split(' ')[0]); // Solo nombre
    const finalizados = choferes.map(c => c.finalizados);
    const cancelados = choferes.map(c => c.cancelados);

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Finalizados',
            data: finalizados,
            backgroundColor: '#10b981',
            borderRadius: 4
          },
          {
            label: 'Cancelados',
            data: cancelados,
            backgroundColor: '#ef4444',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        }
      }
    };

    this.chartRendimiento = new Chart(ctx, config);
  }

  private crearGraficoObrasSociales(): void {
    if (!this.obrasSocialesChart?.nativeElement) return;

    const ctx = this.obrasSocialesChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const datosPacientes = this.pacientesPorObraSocial();
    if (datosPacientes.length === 0) {
      ctx.fillStyle = '#6c757d';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Sin datos de pacientes', ctx.canvas.width / 2, ctx.canvas.height / 2);
      return;
    }

    const colores = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    
    const labels = datosPacientes.map(dato => dato.obraSocial.descripcion);
    const valores = datosPacientes.map(dato => dato.cantidadPacientes);
    const backgroundColors = datosPacientes.map((_, index) => colores[index % colores.length]);

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: valores,
          backgroundColor: backgroundColors,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 15,
              generateLabels: function(chart) {
                const data = chart.data;
                if (data.labels && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const value = data.datasets[0].data[i];
                    const bgColors = data.datasets[0].backgroundColor as string[];
                    return {
                      text: `${label}: ${value}`,
                      fillStyle: bgColors[i],
                      strokeStyle: bgColors[i],
                      lineWidth: 0,
                      pointStyle: 'circle' as const
                    };
                  });
                }
                return [];
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const total = valores.reduce((a, b) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return `${context.label}: ${context.parsed} pacientes (${percentage}%)`;
              }
            }
          }
        },
        cutout: '60%'
      }
    };

    this.chartObrasSociales = new Chart(ctx, config);
  }

  private destruirCharts(): void {
    if (this.chartRendimiento) {
      this.chartRendimiento.destroy();
      this.chartRendimiento = undefined;
    }
    if (this.chartObrasSociales) {
      this.chartObrasSociales.destroy();
      this.chartObrasSociales = undefined;
    }
  }

  // Helper methods
  getColorClass(valor: number, total: number): string {
    const porcentaje = total > 0 ? (valor / total) * 100 : 0;
    if (porcentaje >= 80) return 'text-success';
    if (porcentaje >= 60) return 'text-warning';
    return 'text-danger';
  }

  formatearPorcentaje(valor: number, total: number): string {
    return total > 0 ? `${Math.round((valor / total) * 100)}%` : '0%';
  }
}