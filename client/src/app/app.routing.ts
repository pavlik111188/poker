/**
 * Created by Pavel S on 24.05.17.
 */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './services/auth.guard';

import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { TableComponent } from './components/table/table.component';
import { ChatComponent } from './components/chat/chat.component';

// Consts
import { RolesConst } from './consts/roles.const';

const routes: Routes = [

    {
      path: 'table/:id',
      component: TableComponent,
      data: [{isProd: true}]
    },

    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: '',
                redirectTo: '/dashboard',
                pathMatch: 'full'
            },
            {
              path: 'register',
              component: RegisterComponent
            },
            {
              path: 'login',
              component: LoginComponent
            },
            {
                path: 'dashboard',
                component: DashboardComponent
            },
            {
                path: 'profile',
                component: ProfileComponent
            },
            {
                path: 'chat',
                component: ChatComponent
            }/*,
            {
                path: 'table/:id',
                component: TableComponent,
                data: [{isProd: true}]
            }*/
        ],
        data: {
            'roles': [RolesConst.USER, RolesConst.ADMIN]
        },
        canActivate: [AuthGuard],
    },
];

@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule {}
