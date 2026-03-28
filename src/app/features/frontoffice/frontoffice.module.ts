import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FrontofficeComponent } from './frontoffice.component';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { ProfileComponent } from './profile/profile.component';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: '',
    component: FrontofficeComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', loadComponent: () => import('./home.component').then(m => m.FrontofficeHomeComponent) },
      { path: 'profile', component: ProfileComponent },

      // Venue Owner routes
      {
        path: 'venue',
        children: [
          {
            path: 'my-venues',
            canActivate: [roleGuard],
            data: { role: 'VENUE_OWNER' },
            loadComponent: () => import('./venue/components/my-venues/my-venues.component').then(m => m.MyVenuesComponent)
          },
          {
            path: 'create',
            canActivate: [roleGuard],
            data: { role: 'VENUE_OWNER' },
            loadComponent: () => import('./venue/components/create-venue/create-venue.component').then(m => m.CreateVenueComponent)
          },
          {
            path: 'update/:id',
            canActivate: [roleGuard],
            data: { role: 'VENUE_OWNER' },
            loadComponent: () => import('./venue/components/update-venue/update-venue.component').then(m => m.UpdateVenueComponent)
          },
          {
            path: 'details/:id',
            canActivate: [roleGuard],
            data: { role: 'VENUE_OWNER' },
            loadComponent: () => import('./venue/components/venue-details/venue-details.component').then(m => m.VenueDetailsComponent)
          },
          { path: '', redirectTo: 'my-venues', pathMatch: 'full' }
        ]
      }
    ]
  }
];

@NgModule({
  declarations: [
    ProfileComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    FrontofficeComponent
  ]
})
export class FrontofficeModule {}

