import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'backoffice',
    loadChildren: () => import('./features/backoffice/backoffice.module').then(m => m.BackofficeModule)
  },
  {
    path: '',
    loadChildren: () => import('./features/frontoffice/frontoffice.module').then(m => m.FrontofficeModule)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];