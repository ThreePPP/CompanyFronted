import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LayoutComponent } from './layout/layout.component';
import { authGuard } from './Guard/auth.guard';
import { ProcessComponent } from './cbes/process/process.component';
import { AddComponent } from './cbes/process/add/add.component';
import { EditComponent } from './cbes/process/edit/edit.component';
import { TrashComponent } from './cbes/process/trash/trash.component';
import { MaturityComponent } from './cbes/process/maturity/maturity.component';
import { AddMaturityComponent } from './cbes/process/add/maturity/maturity.component';
import { OwnerComponent } from './cbes/process/owner/owner.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'cbes',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'process', component: ProcessComponent },
      { path: 'process/add', component: AddComponent },
      { path: 'process/add/maturity/:id', component: AddMaturityComponent },
      { path: 'process/edit/:id', component: EditComponent },
      { path: 'process/trash', component: TrashComponent },
      { path: 'process/maturity/:id', component: MaturityComponent },
      { path: 'process/owner/:id', component: OwnerComponent }
    ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
