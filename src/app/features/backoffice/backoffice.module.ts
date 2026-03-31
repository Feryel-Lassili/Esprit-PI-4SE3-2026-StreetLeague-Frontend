import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BackofficeComponent } from './backoffice.component';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: BackofficeComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'ADMIN' },
    children: [
      // Venue Management
      {
        path: 'venue-management',
        children: [
          {
            path: 'owners',
            loadComponent: () => import('./venue-management/components/owners-list/owners-list.component').then(m => m.OwnersListComponent)
          },
          {
            path: 'owners/:ownerId',
            loadComponent: () => import('./venue-management/components/owner-details/owner-details.component').then(m => m.OwnerDetailsComponent)
          },
          {
            path: 'venues',
            loadComponent: () => import('./venue-management/components/admin-venues/admin-venues.component').then(m => m.AdminVenuesComponent)
          },
          { path: '', redirectTo: 'owners', pathMatch: 'full' }
        ]
      },

      // Carpooling Management
      {
        path: 'carpooling-management',
        children: [
          {
            path: 'drivers',
            loadComponent: () => import('./carpooling-management/components/admin-drivers-list/admin-drivers-list.component').then(m => m.AdminDriversListComponent)
          },
          {
            path: 'drivers/:driverId',
            loadComponent: () => import('./carpooling-management/components/admin-driver-details/admin-driver-details.component').then(m => m.AdminDriverDetailsComponent)
          },
          { path: '', redirectTo: 'drivers', pathMatch: 'full' }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    BackofficeComponent
  ]
})
export class BackofficeModule {}