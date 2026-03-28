import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FrontofficeComponent } from './frontoffice.component';
import { authGuard } from '../../core/guards/auth.guard';
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
      { path: 'fantasy',   loadComponent: () => import('./fantasy.component').then(m => m.FrontofficeFantasyComponent) },
      { path: 'profile', component: ProfileComponent }
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
