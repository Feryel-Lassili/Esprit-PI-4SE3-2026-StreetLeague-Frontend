import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { WalletComponent } from './wallet.component';

const routes: Routes = [
  { path: '', component: WalletComponent }
];

@NgModule({
  declarations: [WalletComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class WalletModule {}