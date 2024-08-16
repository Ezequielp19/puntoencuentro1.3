import { SelectUserTypeComponent } from './components/select-user-type/select-user-type.component';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./views/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'recuperarPassword',
    loadComponent: () => import('./components/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent),
  },
    {
    path: 'recuperarEmail',
    loadComponent: () => import('./components/recovery-email/recovery-email.component').then((m) => m.RecoveryEmailComponent),
  },
  {
    path: 'perfil',
    loadComponent: () => import('./views/profile/profile.component').then((m) => m.ProfileComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'historial-citas',
        loadComponent: () => import('./components/historial-citas/historial-citas.component').then((m) => m.HistorialCitasComponent),
      },
      {
        path: 'historial-resenas',
        loadComponent: () => import('./components/historial-resenas/historial-resenas.component').then((m) => m.HistorialResenasComponent),
      },
      {
        path: 'perfilUsuario',
        loadComponent: () => import('./components/perfil/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'horarios',
        loadComponent: () => import('./components/horarios/horarios.component').then(m => m.ScheduleConfigComponent),
      },
      {
        path: 'crearServicio',
        loadComponent: () => import('./components/create-service/create-service.component').then(m => m.CreateServiceComponent),
      },
      {
        path: 'subasta',
        loadComponent: () => import('./components/subasta/subasta.component').then(m => m.SubastaComponent),
      },
       {
        path: 'verServicios',
        loadComponent: () => import('./components/verservices/verservices.component').then(m => m.VerservicesComponent),
      },

      {
        path: 'userlist',
        loadComponent: () => import('./components/service-ver-detalle/service-ver-detalle.component').then(m => m.UserListComponent),
      },
      {
        path: 'homeCliente',
        loadComponent: () => import('./components/home-cliente/home-cliente.component').then((m) => m.HomeClienteComponent),
      },
      {
        path: 'mercadoPago',
        loadComponent: () => import('./components/mercado-pago/mercado-pago.component').then((m) => m.MercadoPagoComponent),
      },
      {
        path: 'crearCategoria',
        loadComponent: () => import('./components/crear-categoria/crear-categoria.component').then(m => m.CrearCategoriaComponent),
      },
      {
        path: 'miServicio',
        loadComponent: () => import('./components/mi-servicio/mi-servicio.component').then(m => m.MiServicioComponent),
      },
      {
        path: '',
        redirectTo: 'homeCliente',
        pathMatch: 'full',
      },
    ],
  },
  // {
  //   path: 'homeCliente',
  //   loadComponent: () => import('./components/home-cliente/home-cliente.component').then((m) => m.HomeClienteComponent),
  // },
  {
    path: 'serviceDetail/:id',
    loadComponent: () => import('./components/service-detail/service-detail.component').then((m) => m.ServiceDetailComponent),
  },
  {
    path: 'cita/:id',
    loadComponent: () => import('./components/cita/cita.component').then((m) => m.CitaComponent),
  },
  {
    path: 'search',
    loadComponent: () => import('./components/search-filters/search-filters.component').then((m) => m.SearchFiltersComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./views/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'tipoUsuario',
    loadComponent: () => import('./components/select-user-type/select-user-type.component').then((m) => m.SelectUserTypeComponent),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
