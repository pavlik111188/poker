import { Injectable } from '@angular/core';
import { HttpClientModule, HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { AuthenticationService } from '../services/authentication.service';
import { Table } from '../models/table.model';

@Injectable()
export class TableService {

  // URLs to web api
  public token: string;
    private domain = 'http://localhost:8085/';
    private newTableUrl = 'add_table';
    private getTableListUrl = 'table_list';

    constructor(
        private http: HttpClient,
        private authenticationService: AuthenticationService

    ) {
    	// set token if saved in local storage
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
    }

    // Adding a new table
    createNewTable(name: string) {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token});
        const url = `${this.domain}${this.newTableUrl}`;
        return this.http.post(url, {name: name}, {headers: headers})
            .map(response => response);
    }

    tableList() {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token});
        const url = `${this.domain}${this.getTableListUrl}`;
        return this.http.get<Table>(url, {headers: headers})
            .map((response) => response);
    }

}
