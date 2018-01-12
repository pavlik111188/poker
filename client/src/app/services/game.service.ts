import { Injectable } from '@angular/core';
import { HttpClientModule, HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { AuthenticationService } from '../services/authentication.service';
import { Game } from '../models/game.model';

@Injectable()
export class GameService {

  // URLs to web api
  public token: string;
  private domain = 'http://localhost:8085/';
  private getGameListUrl = 'games';

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService

  ) {
    // set token if saved in local storage
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
  }

  gameList() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token});
    const url = `${this.domain}${this.getGameListUrl}`;
    return this.http.get<Game>(url, {headers: headers})
      .map((response) => response);
  }

}
