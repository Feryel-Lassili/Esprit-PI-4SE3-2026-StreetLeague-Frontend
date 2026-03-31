import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FrontofficeComponent } from './frontoffice.component';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { ProfileComponent } from './profile/profile.component';
import { FormsModule } from '@angular/forms';
import { FrontofficeShopComponent } from './shop.component';
import { PlayerMerchandiseComponent } from './player-merchandise.component';

const routes: Routes = [
  {
    path: '',
    component: FrontofficeComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', loadComponent: () => import('./home.component').then(m => m.FrontofficeHomeComponent) },
      { path: 'profile', component: ProfileComponent },

      // Teams
      { path: 'teams', loadComponent: () => import('./teams/teams.component').then(m => m.FrontofficeTeamsComponent) },

      // Venues (player)
      { path: 'venues', loadComponent: () => import('./venues/venues.component').then(m => m.FrontofficeVenuesComponent) },

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
          {
            path: 'reservations',
            canActivate: [roleGuard],
            data: { role: 'VENUE_OWNER' },
            loadComponent: () => import('./venue/components/owner-reservations/owner-reservations.component').then(m => m.OwnerReservationsComponent)
          },
          { path: '', redirectTo: 'my-venues', pathMatch: 'full' }
        ]
      },

      // Carpooling routes
      {
        path: 'carpooling',
        children: [
          { path: '', loadComponent: () => import('./carpooling/components/carpooling-list/carpooling-list.component').then(m => m.CarpoolingListComponent) },
          { path: 'create', loadComponent: () => import('./carpooling/components/create-carpooling/create-carpooling.component').then(m => m.CreateCarpoolingComponent) },
          { path: 'my-trips', loadComponent: () => import('./carpooling/components/my-trips/my-trips.component').then(m => m.MyTripsComponent) },
          { path: 'my-joined', loadComponent: () => import('./carpooling/components/my-joined/my-joined.component').then(m => m.MyJoinedComponent) },
          { path: 'details/:id', loadComponent: () => import('./carpooling/components/trip-details/trip-details.component').then(m => m.TripDetailsComponent) }
        ]
      },

      // Cars routes
      {
        path: 'cars',
        children: [
          { path: '', loadComponent: () => import('./carpooling/components/my-cars/my-cars.component').then(m => m.MyCarsComponent) }
        ]
      },

      // Shop & Merchandise
      { path: 'shop', component: FrontofficeShopComponent },
      { path: 'my-merchandise', component: PlayerMerchandiseComponent },

      // Sponsors
      { path: 'sponsors', loadComponent: () => import('./sponsors.component').then(m => m.FrontofficeSponsorsComponent) },

      // Health
      { path: 'health', loadChildren: () => import('./health/health.module').then(m => m.HealthModule) },

      // Wallet
      { path: 'wallet', loadChildren: () => import('./wallet/wallet.module').then(m => m.WalletModule) }
    ]
  }
];

@NgModule({
  declarations: [
    ProfileComponent,
    FrontofficeShopComponent,
    PlayerMerchandiseComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    FrontofficeComponent
  ]
})
export class FrontofficeModule {}
