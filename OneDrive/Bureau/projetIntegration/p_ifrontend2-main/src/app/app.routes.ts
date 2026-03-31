import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () =>
      import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'backoffice',
    loadChildren: () =>
      import('./features/backoffice/backoffice.module').then(m => m.BackofficeModule)
  },
  {
    path: '',
    loadComponent: () =>
      import('./features/frontoffice/frontoffice.component')
        .then(m => m.FrontofficeComponent),
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./features/frontoffice/home.component')
            .then(m => m.FrontofficeHomeComponent)
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./event/event-list/event-list.component')
            .then(m => m.EventListComponent)
      },
      {
        path: 'matches',
        loadComponent: () =>
          import('./matches/match-list/match-list.component')
            .then(m => m.MatchListComponent)
      },
      {
        path: 'trainings',
        loadComponent: () =>
          import('./trainings/training-list/training-list.component')
            .then(m => m.TrainingListComponent)
      },
      {
        path: 'tournaments',
        loadComponent: () =>
          import('./tournaments/tournament-list/tournament-list.component')
            .then(m => m.TournamentListComponent)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];