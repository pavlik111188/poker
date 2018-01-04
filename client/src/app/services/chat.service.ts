import { Injectable } from '@angular/core';
import { HttpClientModule, HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { AuthenticationService } from '../services/authentication.service';

@Injectable()
export class ChatService {

  public token: string;
  private domain = 'http://localhost:8085/';
  private getChatByRoomUrl = 'chat/';
  private getTableListUrl = 'table_list';
  private getTableInfoUrl = 'table_info';

  constructor(
      private http: HttpClient,
      private authenticationService: AuthenticationService

  ) {
    // set token if saved in local storage
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.token = currentUser && currentUser.token;
  }

  getChatByRoom(room) {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token});
      const url = `${this.domain}${this.getChatByRoomUrl}${room}`;
      return this.http.get(url, {headers: headers})
          .map((response) => response);
  }

  saveChat(data) {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token});
      const url = `${this.domain}${this.getChatByRoomUrl}`;
      return this.http.post(url, data, {headers: headers})
          .map(response => response);
  }

  // tableList() {
  //     const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token});
  //     const url = `${this.domain}${this.getTableListUrl}`;
  //     return this.http.get<Table>(url, {headers: headers})
  //         .map((response) => response);
  // }

}