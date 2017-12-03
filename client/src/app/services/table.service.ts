import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { AuthenticationService } from '../services/authentication.service';

@Injectable()
export class TableService {

  // URLs to web api
  public token: string;
    private domain = 'http://localhost:8085/';
    private newTableUrl = 'add_table';

    constructor(
        private http: Http,
        private authenticationService: AuthenticationService,
    ) {
    	// set token if saved in local storage
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
    }

    // Adding a new table
    createNewTable(name: string) {

        //const headers = new Headers({ 'Content-Type': 'x-www-form-urlencoded' });
        const headers = new Headers({ 'Content-Type': 'application/json', 'Authorization': this.token});
        const options = new RequestOptions({ headers: headers });
        const url = `${this.domain}${this.newTableUrl}`;
        return this.http.post(url, {name: name}, options)
            .map(response => response.json());
    }

}
