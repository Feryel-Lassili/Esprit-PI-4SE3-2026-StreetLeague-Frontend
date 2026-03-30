import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FrontofficeComponent } from './frontoffice.component';
import { authGuard } from '../../core/guards/auth.guard';
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
      { path: 'shop', component: FrontofficeShopComponent },
      { path: 'my-merchandise', component: PlayerMerchandiseComponent },
      { path: 'sponsors', loadComponent: () => import('./sponsors.component').then(m => m.FrontofficeSponsorsComponent) },
      
      { path: 'health', loadChildren: () => import('./health/health.module').then(m => m.HealthModule) },
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
