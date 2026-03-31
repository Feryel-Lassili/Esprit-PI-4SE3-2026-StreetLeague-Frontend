import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HealthComponent } from './health.component';

const routes: Routes = [
  { path: '', component: HealthComponent }
];

@NgModule({
  declarations: [HealthComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class HealthModule {}