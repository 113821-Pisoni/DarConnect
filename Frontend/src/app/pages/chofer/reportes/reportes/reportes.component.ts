// dashboard-chofer.component.ts
import { Component, OnInit, ViewChild, ElementRef, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { ChoferService } from '../../../../services/chofer.service';
// SOLO importar de chofer.interface.ts
import { EstadisticasChoferResponse, MetricaCard, ChoferData } from '../../../../interfaces/chofer.interface';

Chart.register(...registerables);

@Component({
  selector: 'app-reportes-chofer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit, OnDestroy {
  @ViewChild('tendenciaChart', { static: false }) tendenciaChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('tiposChart', { static: false }) tiposChart!: ElementRef<HTMLCanvasElement>;

  // Signals
  loading = signal<boolean>(false);
  error = signal<string>('');
  periodo = signal<string>('semana');
  chofer = signal<ChoferData | null>(null);
  estadisticas = signal<EstadisticasChoferResponse | null>(null);

  // Chart instances
  private chartTendencia?: Chart;
  private chartTipos?: Chart;

  // Computed properties
  metricas = computed(() => {
    const stats = this.estadisticas();
    if (!stats) return [];

    return [
      {
        titulo: 'Total Traslados',
        valor: stats.trasladosHoy,
        icono: 'bi-car-front-fill',
        color: 'primary',
        sufijo: ''
      },
      {
        titulo: 'Finalizados',
        valor: stats.trasladosSemana,
        icono: 'bi-check-circle-fill',
        color: 'success',
        sufijo: ''
      },
      {
        titulo: 'Cancelados',
        valor: stats.trasladosMes,
        icono: 'bi-x-circle-fill',
        color: 'danger',
        sufijo: ''
      },
      {
        titulo: 'Con Silla',
        valor: stats.conSillaRuedas,
        icono: 'bi-person-wheelchair',
        color: 'info',
        sufijo: ''
      }
    ];
  });

  tituloGrafico = computed(() => {
    const periodo = this.periodo();
    switch (periodo) {
      case 'hoy': return 'Traslados de hoy';
      case 'semana': return 'Traslados por día';
      case 'mes': return 'Traslados por semana';
      case 'año': return 'Traslados por mes';
      default: return 'Tendencia de traslados';
    }
  });

  constructor(private choferService: ChoferService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.destruirCharts();
  }

  cargarDatos(): void {
    this.loading.set(true);
    this.error.set('');

    this.choferService.getCurrentChofer().subscribe({
      next: (chofer) => {
        this.chofer.set(chofer);
        this.choferService.getEstadisticasChofer(chofer.id, this.periodo()).subscribe({
          next: (data) => {
            this.estadisticas.set(data);
            this.loading.set(false);
            setTimeout(() => this.crearGraficos(), 100);
          },
          error: (error) => {
            console.error('Error al cargar estadísticas:', error);
            this.error.set('Error al cargar las estadísticas');
            this.loading.set(false);
          }
        });
      },
      error: (error) => {
        console.error('Error al obtener chofer:', error);
        this.error.set('Error al obtener información del chofer');
        this.loading.set(false);
      }
    });
  }

  onPeriodoChange(event: any): void {
    this.periodo.set(event.target.value);
    this.cargarDatos();
  }

  private crearGraficos(): void {
    const stats = this.estadisticas();
    if (!stats) return;

    this.destruirCharts();
    this.crearGraficoTendencia(stats);
    this.crearGraficoTipos(stats);
  }

  private crearGraficoTendencia(stats: EstadisticasChoferResponse): void {
    if (!this.tendenciaChart?.nativeElement) return;

    const ctx = this.tendenciaChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = stats.trasladosPorDia.map(item => item.dia);
    const data = stats.trasladosPorDia.map(item => item.cantidad);

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Traslados finalizados',
          data,
          borderColor: '#0d6efd',
          backgroundColor: 'rgba(13, 110, 253, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#0d6efd',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            display: false 
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            cornerRadius: 8
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { 
              stepSize: 1,
              color: '#6c757d'
            },
            grid: {
              color: 'rgba(0,0,0,0.1)'
            }
          },
          x: {
            ticks: {
              color: '#6c757d'
            },
            grid: {
              display: false
            }
          }
        }
      }
    };

    this.chartTendencia = new Chart(ctx, config);
  }

  private crearGraficoTipos(stats: EstadisticasChoferResponse): void {
    if (!this.tiposChart?.nativeElement) return;

    const ctx = this.tiposChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const total = stats.conSillaRuedas + stats.sinSillaRuedas;
    
    if (total === 0) {
      ctx.fillStyle = '#6c757d';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Sin datos para mostrar', ctx.canvas.width / 2, ctx.canvas.height / 2);
      return;
    }

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: ['Sin silla de ruedas', 'Con silla de ruedas'],
        datasets: [{
          data: [stats.sinSillaRuedas, stats.conSillaRuedas],
          backgroundColor: ['#0d6efd', '#198754'],
          borderColor: ['#ffffff', '#ffffff'],
          borderWidth: 2,
          hoverOffset: 6
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
              padding: 20,
              color: '#495057'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            cornerRadius: 8,
            callbacks: {
              label: function(context) {
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return `${context.label}: ${context.parsed} (${percentage}%)`;
              }
            }
          }
        },
        cutout: '60%'
      }
    };

    this.chartTipos = new Chart(ctx, config);
  }

  private destruirCharts(): void {
    if (this.chartTendencia) {
      this.chartTendencia.destroy();
      this.chartTendencia = undefined;
    }
    if (this.chartTipos) {
      this.chartTipos.destroy();
      this.chartTipos = undefined;
    }
  }
}