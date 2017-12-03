/**
 * Created by Pavel S on 01.06.17.
 *
 */

import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';


import { AuthenticationService } from '../services/authentication.service';

@Injectable()
export class UserService {

    // URLs to web api
    private domain = this.authenticationService.domain;
    private signupUrl = 'signup';
    private loginUrl = 'login';

    constructor(
        private http: Http,
        private authenticationService: AuthenticationService,
    ) {}


    // User registration
    singup(user: any) {
        //const headers = new Headers({ 'Content-Type': 'x-www-form-urlencoded' });
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ headers: headers });
        const url = `${this.domain}${this.signupUrl}`;
        console.log('User:', user);
        return this.http.post(url, user, options)
            .map(response => response.json());
    }

    // User login
    login(user: any) {
        // const headers = new Headers({ 'Content-Type': 'x-www-form-urlencoded' });
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ headers: headers });
        const url = `${this.domain}${this.loginUrl}`;

        // Format {sucess: true/false, token: 'token', "user": {  "id": "592bf769e6f5834f39fcbfdf",  "name": "Pavel",  "group": "0" } }
        return this.http.post(url, user, options)
            .map(response => response.json());
    }


}
