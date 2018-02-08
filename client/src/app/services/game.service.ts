import { Injectable } from '@angular/core';
import { HttpClientModule, HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { AuthenticationService } from '../services/authentication.service';
import { Game } from '../models/game.model';
import { StartedGame } from '../models/started_game.model';
import {GamePart} from "../models/game_part.model";

@Injectable()
export class GameService {

  // URLs to web api
  public token: string;
  private domain = 'http://localhost:8085/';
  private getGameListUrl = 'games';
  private getStartedGameUrl = 'get_started_game';
  private addStartedGameUrl = 'add_started_game';
  private addGamePartUrl = 'add_game_part';
  private getGamePartUrl = 'get_game_part';

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

  getStartedGame(data) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token});
    const url = `${this.domain}${this.getStartedGameUrl}`;
    return this.http.get<StartedGame>(url, {headers: headers, params: data})
      .map((response) => response);
  }

  addStartedGame(data) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token});
    const url = `${this.domain}${this.addStartedGameUrl}`;
    return this.http.post(url, {game: data.game, table: data.table, trump: data.trump}, {headers: headers})
      .map(response => response);
  }

  addGamePart(data) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token});
    const url = `${this.domain}${this.addGamePartUrl}`;
    return this.http.post(url, data, {headers: headers})
      .map(response => response);
  }

  getGamePart(data) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token});
    const url = `${this.domain}${this.getGamePartUrl}`;
    return this.http.get<GamePart>(url, {headers: headers, params: data})
      .map((response) => response);
  }

}
