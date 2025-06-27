// src/app/components/navbar/navbar.component.ts
import { Component, OnInit, signal, computed, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ChoferService } from '../../services/chofer.service';
import { LoginResponse } from '../../interfaces/auth.interface';
import { ChoferData } from '../../interfaces/chofer.interface';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

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
  isMobile = signal<boolean>(false);

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

    // Detectar tamaño de pantalla inicial
    this.isMobile.set(window.innerWidth < 992);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile.set(window.innerWidth < 992);
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

  toggleSidebar() {
    // Emitir evento para que el sidebar lo escuche
    window.dispatchEvent(new CustomEvent('toggleSidebar'));
  }

  showFAQ() {
    this.closeDropdown();
    Swal.fire({
      title: 'PREGUNTAS FRECUENTES - DARCONNECT',
      html: `
        <div style="text-align: left; max-height: 400px; overflow-y: auto;">
          <div style="margin-bottom: 20px;">
            <p><strong>1. ¿Qué es DarConnect?</strong></p>
            <p>DarConnect es una aplicación que permite conectar a choferes y administradores de empresas de traslado de pacientes bajo tratamiento crónico, para coordinar viajes de forma más eficiente.</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p><strong>2. ¿Quiénes pueden usar DarConnect?</strong></p>
            <p>Solo usuarios autorizados por el administrador del sistema. No está habilitado el registro libre ni público.</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p><strong>3. ¿Cómo accedo a la aplicación?</strong></p>
            <p>Recibirás un usuario y contraseña generados por el administrador del sistema. Una vez habilitado, podrás ingresar desde la app.</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p><strong>4. ¿DarConnect es gratuita?</strong></p>
            <p>No. El servicio funciona por suscripción mensual, con facturación automática a través de tarjeta de crédito.</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p><strong>5. ¿Qué información personal recolecta la app?</strong></p>
            <p>Nombre, email, DNI, número de teléfono, ubicación (durante uso activo) y carnet de conducir.</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p><strong>6. ¿Para qué se usa mi ubicación?</strong></p>
            <p>Se utiliza para calcular rutas, tiempos y distancias entre puntos, mejorando la eficiencia del traslado.</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p><strong>7. ¿Mis datos están protegidos?</strong></p>
            <p>Sí. Aplicamos medidas de seguridad y no compartimos tus datos con terceros no autorizados.</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p><strong>8. ¿Puedo darme de baja?</strong></p>
            <p>Sí. Podés solicitar la baja de tu usuario en cualquier momento y también solicitar la eliminación definitiva de tus datos personales.</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p><strong>9. ¿Qué pasa si olvido mi contraseña o tengo problemas para acceder?</strong></p>
            <p>Podés contactar al soporte escribiendo a <strong><a href="mailto:connectreclamos@connect.com" style="color: #0066cc; text-decoration: none;">connectreclamos@connect.com</a></strong> para recuperar el acceso o resolver cualquier inconveniente.</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p><strong>10. ¿Se puede usar la app sin conexión?</strong></p>
            <p>No. DarConnect requiere conexión a Internet para funcionar correctamente, ya que utiliza servicios como mapas y notificaciones.</p>
          </div>
        </div>
      `,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#3085d6',
      width: '800px'
    });
  }

  showContact() {
    this.closeDropdown();
    Swal.fire({
      title: 'CONTÁCTENOS - DARCONNECT',
      html: `
        <div style="text-align: left; max-height: 400px; overflow-y: auto;">
          <p>Para consultas, soporte técnico, solicitud de acceso o baja del servicio, o para ejercer sus derechos sobre datos personales, puede comunicarse con nosotros a través de los siguientes medios:</p>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
            <p style="margin-bottom: 10px;"><strong>📧 Correo electrónico:</strong> <a href="mailto:connectreclamos@connect.com" style="color: #0066cc; text-decoration: none;">connectreclamos@connect.com</a></p>
            <p style="margin-bottom: 0;"><strong>🕐 Horario de atención:</strong> Lunes a viernes, de 9:00 a 18:00 (hora Argentina)</p>
          </div>
          
          <p>Responderemos su mensaje a la brevedad. Gracias por utilizar <strong>DarConnect</strong>.</p>
        </div>
      `,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#3085d6',
      width: '600px'
    });
  }

  logout() {
    this.closeDropdown();
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}