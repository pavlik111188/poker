import { Injectable } from '@angular/core';
import { HttpClientModule, HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { AuthenticationService } from '../services/authentication.service';
import { UsersInChat } from '../models/users_in_chat.model';

@Injectable()
export class ChatService {

  public token: string;
  private domain = 'http://localhost:8085/';
  private getChatByRoomUrl = 'chat/get_messages';
  private saveMessageUrl = 'chat/';
  private getUsersInChatUrl = 'get_users_in_chat';
  private getTableInfoUrl = 'table_info';

  constructor(
      private http: HttpClient,
      private authenticationService: AuthenticationService

  ) {
    // set token if saved in local storage
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.token = currentUser && currentUser.token;
  }

  /*getChatByRoom(room) {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token});
      const url = `${this.domain}${this.getChatByRoomUrl}`;
      return this.http.get(url, {headers: headers, params: room})
          .map((response) => response);
  }*/

  getChatByRoom(data) {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token});
      const url = `${this.domain}${this.getChatByRoomUrl}`;
      return this.http.post(url, data, {headers: headers})
          .map(response => response);
  }

  saveMessage(data) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token});
    const url = `${this.domain}${this.saveMessageUrl}`;
    return this.http.post(url, data, {headers: headers})
      .map(response => response);
  }

  getUsersInChat(room) {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token});
      const url = `${this.domain}${this.getUsersInChatUrl}`;
      return this.http.get<UsersInChat>(url, {headers: headers, params: {room: room}})
          .map((response) => response as UsersInChat);
  }

  // tableList() {
  //     const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token});
  //     const url = `${this.domain}${this.getTableListUrl}`;
  //     return this.http.get<Table>(url, {headers: headers})
  //         .map((response) => response);
  // }

}
