import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login.component';
import { guestGuard } from '../../core/guards/guest.guard';

const routes: Routes = [
  { path: '', component: LoginComponent, canActivate: [guestGuard] }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    LoginComponent
  ]
})
export class AuthModule {}