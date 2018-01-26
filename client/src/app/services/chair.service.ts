import { Injectable } from '@angular/core';
import { HttpClientModule, HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { AuthenticationService } from '../services/authentication.service';
import { Chair } from '../models/chair.model';

@Injectable()
export class ChairService {

  // URLs to web api
  public token: string;
  private domain = 'http://localhost:8085/';
  private getChairListUrl = 'chairs_list';

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService

  ) {
    // set token if saved in local storage
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
  }

  chairList() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token});
    const url = `${this.domain}${this.getChairListUrl}`;
    return this.http.get<Chair>(url, {headers: headers})
      .map((response) => response);
  }

}
