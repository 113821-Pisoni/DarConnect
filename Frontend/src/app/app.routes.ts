// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { SimplePageComponent } from './pages/simple-page/simple-page.component';
import { MisTrasladosComponent } from './pages/chofer/mis-traslados/mis-traslados.component';
import { AgendaComponent } from './pages/chofer/agenda/agenda.component';
import { TrasladosDiaComponent } from './pages/admin/traslados-dia/traslados-dia.component';
import { UsuariosComponent } from './pages/admin/usuarios/usuarios.component';
import { ChoferesComponent } from './pages/admin/choferes/choferes.component'; 
import { PacientesComponent } from './pages/admin/pacientes/pacientes.component';
import { ObrasSocialesComponent } from './pages/admin/obras-sociales/obras-sociales.component';
import { AgendasComponent } from './pages/admin/agendas/agendas.component';
import { TrasladosComponent } from './pages/admin/traslados/traslados.component';

export const routes: Routes = [
  // Ruta raíz - redirige al login
  { 
    path: '', 
    redirectTo: '/auth/login', 
    pathMatch: 'full' 
  },

  // Rutas de autenticación (sin navbar/sidebar)
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // Rutas del CHOFER (protegidas)
  {
    path: 'chofer',
    canActivate: [authGuard],
    children: [
      { 
        path: 'mis-traslados', 
        component: MisTrasladosComponent 
      },
      { 
        path: 'agenda', 
        component: AgendaComponent 
      },
      { 
        path: 'estadisticas', 
        component: SimplePageComponent 
      },
      // TODO: Crear páginas específicas
      // { path: 'agenda', component: AgendaComponent },
      // { path: 'estadisticas', component: EstadisticasComponent },
      
      { path: '', redirectTo: 'mis-traslados', pathMatch: 'full' }
    ]
  },

  // Rutas del ADMINISTRADOR (protegidas)
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      { 
        path: 'traslados-dia', 
        component: TrasladosDiaComponent 
      },
      { 
      path: 'usuarios', 
      component: UsuariosComponent 
      },
      { 
      path: 'choferes', 
      component: ChoferesComponent 
      },
      { 
      path: 'pacientes', 
      component: PacientesComponent
      },
      { 
      path: 'obras-sociales', 
      component: ObrasSocialesComponent
      },
      { 
        path: 'agenda', 
        component: AgendasComponent
      },
      { 
        path: 'traslados', 
        component: TrasladosComponent
      },
      { 
        path: 'dashboard', 
        component: SimplePageComponent 
      },
      // TODO: Crear páginas de administrador
      // { path: 'choferes', component: ChoferesComponent },
      // { path: 'pacientes', component: PacientesComponent },
      // { path: 'traslados', component: TrasladosComponent },
      
      { path: '', redirectTo: 'traslados-dia', pathMatch: 'full' }
    ]
  },

  // Redirecciones por compatibilidad (temporales)
  { path: 'mis-traslados', redirectTo: '/chofer/mis-traslados' },
  { path: 'agenda', redirectTo: '/chofer/agenda' },
  { path: 'estadisticas', redirectTo: '/chofer/estadisticas' },
  { path: 'dashboard', redirectTo: '/admin/dashboard' },

  // Ruta wildcard - redirige según el rol
  { path: '**', redirectTo: '/chofer/mis-traslados' }
];