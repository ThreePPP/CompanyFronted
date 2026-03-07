import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LayoutComponent } from './layout/layout.component';
import { ProcessComponent } from './cbes/process/process.component';
import { AddComponent } from './cbes/process/add/add.component';
import { EditComponent } from './cbes/process/edit/edit.component';
import { TrashComponent } from './cbes/process/trash/trash.component';
import { MaturityComponent } from './cbes/process/maturity/maturity.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'cbes',
    component: LayoutComponent,
    children: [
      { path: 'process', component: ProcessComponent },
      { path: 'process/add', component: AddComponent },
      { path: 'process/edit/:id', component: EditComponent },
      { path: 'process/trash', component: TrashComponent },
      { path: 'process/maturity/:id', component: MaturityComponent }
    ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
