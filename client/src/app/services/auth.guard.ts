/**
 * Created by Pavel S on 01.06.17.
 */

import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Observable } from 'rxjs/Observable';


import { FlashMessagesService } from 'angular2-flash-messages';
import { AuthenticationService } from './authentication.service';


@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private flashMessagesService: FlashMessagesService
    ) { }

    // canActivate(routes, state): boolean {
    //     return true;
    // }

    canActivate(routes, state): Observable<boolean> | Promise<boolean> | boolean {
        const roles = routes.data['roles'];
        //console.log('Required role: ', roles);

        return new Observable(observer => {
            this.authenticationService.getUserRole().subscribe(
                group => {
                    // if role = define
                    //console.log('This roles: ', group);
                    if (group) {
                        // logged in so return true
                        let hasPermission;
                        if ((this.authenticationService.userRole) && (group === undefined)) {
                            hasPermission = roles.indexOf(this.authenticationService.userRole) !== -1;
                        } else {
                            hasPermission = roles.indexOf(group) !== -1;
                        }
                        /*console.log('User role: ', group);
                        console.log('Has permission: ', hasPermission);*/
                        if (!hasPermission) {
                            this.flashMessagesService.show('Sorry, you don`t have permission to that page', { cssClass: 'alert-success', timeout: 3000 });
                            this.router.navigate(['/login']);
                        }
                        observer.next(hasPermission);
                    } else {
                        observer.next(false);
                        // not logged in so redirect to login page
                        this.router.navigate(['/login']);
                        this.flashMessagesService.show('Sorry, you don`t have permission to that page. Please log in.', { cssClass: 'alert-danger', timeout: 3000 });
                    }
                },
                error => {
                    observer.next(false);
                    // not logged in so redirect to login page
                    this.router.navigate(['/login']);
                    this.flashMessagesService.show('Please log in', { cssClass: 'alert-danger', timeout: 3000 });
                }
            );
        });
    }
}
