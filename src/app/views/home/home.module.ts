import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home.component';
import { AppSharedModule } from '../../shared/shared.module';

const ROUTES: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
];

@NgModule({
  declarations: [HomeComponent],
  imports: [
    AppSharedModule,
    RouterModule.forChild(ROUTES),
  ],
  providers: [],
  exports: [HomeComponent],
})
export class HomeModule {}
