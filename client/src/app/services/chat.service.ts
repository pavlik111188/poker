import { Injectable } from '@angular/core';
import { HttpClientModule, HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { AuthenticationService } from '../services/authentication.service';
import { UsersInChat } from '../models/users_in_chat.model';
import {Message} from "../models/message.model";

@Injectable()
export class ChatService {

  public token: string;
  private domain = 'http://localhost:8085/';
  private getChatByRoomUrl = 'get_messages';
  private saveMessageUrl = 'chat/save_message';
  private getUsersInChatUrl = 'get_users_in_chat';
  private addUserToChatUrl = 'add_user_to_chat';

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
      const url = `${this.domain}${this.getChatByRoomUrl}`;
      return this.http.get<Message>(url, {headers: headers, params: {room: room}})
        .map((response) => response as Message);
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

  addUserToChat(data) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token});
    const url = `${this.domain}${this.addUserToChatUrl}`;
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
