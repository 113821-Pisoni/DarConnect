// src/app/auth/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { first } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      remember: [false],
      acceptTerms: [true, Validators.requiredTrue],  
      acceptPrivacy: [true, Validators.requiredTrue] 
    });
  }

  // Getter para fácil acceso a los campos del formulario
  get f() { return this.loginForm.controls; }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  showTermsAndConditions() {
    Swal.fire({
      title: 'TÉRMINOS Y CONDICIONES DE USO - DARCONNECT',
      html: `
        <div style="text-align: left; max-height: 400px; overflow-y: auto;">
          <p><strong>1. Aceptación de los Términos</strong></p>
          <p>El presente documento establece los Términos y Condiciones de uso de la aplicación "DarConnect", destinada a facilitar la comunicación entre administradores y choferes de empresas de traslado de pacientes bajo tratamiento crónico. El acceso y uso del servicio implica la aceptación plena y sin reservas de estos Términos.</p>
          
          <p><strong>2. Usuarios habilitados</strong></p>
          <p>El uso de la aplicación está restringido a usuarios previamente registrados y autorizados por el titular de DarConnect. No está habilitado el registro libre por parte de terceros. La aplicación está destinada exclusivamente a personas vinculadas a empresas de traslado habilitadas.</p>
          
          <p><strong>3. Condiciones del servicio</strong></p>
          <p>El servicio se presta bajo la modalidad de suscripción mensual, con facturación automática a través de tarjeta de crédito. Las suscripciones se renuevan de forma automática, salvo cancelación previa por parte del usuario, la cual podrá realizarse en cualquier momento.</p>
          
          <p><strong>4. Responsabilidades del usuario</strong></p>
          <p>El usuario se compromite a:</p>
          <ul>
            <li>Utilizar la aplicación conforme a la ley y a los presentes Términos.</li>
            <li>Garantizar que los datos personales y documentación provistos sean veraces y actualizados.</li>
            <li>No intentar acceder a funcionalidades no habilitadas o utilizar la aplicación para fines distintos a los previstos.</li>
          </ul>
          
          <p><strong>5. Exclusión de garantías y limitación de responsabilidad</strong></p>
          <p>DarConnect se provee "tal como está". El titular del sistema no garantiza la disponibilidad ininterrumpida ni la ausencia de errores. El titular no asume responsabilidad alguna por daños directos o indirectos derivados del uso o imposibilidad de uso de la aplicación.</p>
          
          <p><strong>6. Contenido generado por usuarios</strong></p>
          <p>DarConnect no permite la publicación de contenido generado por usuarios. Toda la información presente en la aplicación es administrada por el titular o por terceros autorizados.</p>
          
          <p><strong>7. Modificaciones</strong></p>
          <p>El titular podrá modificar en cualquier momento los presentes Términos y Condiciones. Dichos cambios serán informados mediante los canales habituales y se considerarán aceptados si el usuario continúa utilizando la aplicación.</p>
          
          <p><strong>8. Legislación aplicable y jurisdicción</strong></p>
          <p>Estos Términos se rigen por las leyes de la República Argentina. Ante cualquier controversia derivada del uso del servicio, las partes se someten a la jurisdicción de los tribunales ordinarios del país.</p>
          
          <p><strong>9. Contacto</strong></p>
          <p>Para consultas, reclamos o solicitudes relacionadas con el servicio, los usuarios pueden comunicarse al correo: connectreclamos@connect.com</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cerrar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      width: '800px'
    }).then((result) => {
      // Solo marcar como aceptado si presionó "Aceptar"
      if (result.isConfirmed) {
        this.loginForm.patchValue({ acceptTerms: true });
      }
      // Si presiona "Cerrar" o cierra el modal, no hacer nada
    });
  }

  showPrivacyPolicy() {
    Swal.fire({
      title: 'POLÍTICA DE PRIVACIDAD - DARCONNECT',
      html: `
        <div style="text-align: left; max-height: 400px; overflow-y: auto;">
          <p><strong>1. Responsable del tratamiento de datos</strong></p>
          <p>El titular de la aplicación "DarConnect" es responsable del tratamiento de los datos personales recolectados a través del sistema.</p>
          
          <p><strong>2. Datos recolectados</strong></p>
          <p>Los datos que se recopilan de los usuarios incluyen:</p>
          <ul>
            <li>Nombre completo</li>
            <li>Dirección de correo electrónico</li>
            <li>Número de teléfono</li>
            <li>Documento Nacional de Identidad (DNI)</li>
            <li>Ubicación geográfica (durante el uso de la aplicación)</li>
            <li>Carnet de conducir (imagen o datos asociados)</li>
          </ul>
          
          <p><strong>3. Finalidad del tratamiento</strong></p>
          <p>Los datos se utilizan exclusivamente para:</p>
          <ul>
            <li>Gestionar el acceso a la aplicación</li>
            <li>Control de identidad de choferes y administradores</li>
            <li>Gestionar la operativa de traslados de pacientes</li>
            <li>Obtener distancias y tiempos de recorrido mediante integración con Google Distance Matrix</li>
            <li>Enviar notificaciones y mensajes por Telegram</li>
          </ul>
          
          <p><strong>4. Base legal</strong></p>
          <p>El tratamiento de datos se realiza conforme a la Ley N° 25.326 de Protección de Datos Personales de la República Argentina, con el consentimiento expreso del usuario al utilizar la aplicación.</p>
          
          <p><strong>5. Conservación de datos</strong></p>
          <p>Los datos personales se conservarán por tiempo indefinido, incluso en caso de baja del usuario, bajo modalidad de baja lógica, salvo que el usuario solicite su eliminación definitiva.</p>
          
          <p><strong>6. Transferencia de datos a terceros</strong></p>
          <p>Actualmente no se comparten datos personales con terceros, salvo integraciones necesarias para el funcionamiento de servicios (Google, Telegram). En caso de futuras transferencias, se notificará oportunamente a los usuarios.</p>
          
          <p><strong>7. Derechos del titular de los datos</strong></p>
          <p>Los usuarios pueden solicitar en cualquier momento:</p>
          <ul>
            <li>Acceder a los datos personales almacenados</li>
            <li>Rectificar datos incorrectos o desactualizados</li>
            <li>Solicitar la baja o eliminación definitiva</li>
          </ul>
          <p>Para ejercer estos derechos, deberán enviar un correo a: connectreclamos@connect.com</p>
          
          <p><strong>8. Seguridad de la información</strong></p>
          <p>Se aplican medidas razonables de seguridad para proteger los datos personales, incluyendo restricciones de acceso, almacenamiento seguro y comunicación encriptada cuando corresponda.</p>
          
          <p><strong>9. Cambios en esta política</strong></p>
          <p>La presente política podrá ser modificada en cualquier momento. Las actualizaciones serán comunicadas por medios digitales y entrarán en vigencia desde su publicación.</p>
          
          <p><strong>10. Jurisdicción</strong></p>
          <p>Esta Política de Privacidad se rige por las leyes vigentes en la República Argentina.</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cerrar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      width: '800px'
    }).then((result) => {
      // Solo marcar como aceptado si presionó "Aceptar"
      if (result.isConfirmed) {
        this.loginForm.patchValue({ acceptPrivacy: true });
      }
      // Si presiona "Cerrar" o cierra el modal, no hacer nada
    });
  }

  onSubmit() {
    this.submitted = true;

    // Detener aquí si el formulario es inválido
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    
    this.authService.login(this.f['username'].value, this.f['password'].value)
      .pipe(first())
      .subscribe({
        next: (data) => {
          // Redireccionar basado en el rol
          if (data.user.role === 'ADMINISTRADOR') {
            this.router.navigate(['/admin/dashboard']);
          } else if (data.user.role === 'CHOFER') {
            this.router.navigate(['/chofer/dashboard']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (error) => {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error de inicio de sesión',
            text: 'Usuario o contraseña incorrectos',
            confirmButtonColor: '#d33'
          });
        }
      });
  }
}