import { Injectable } from '@angular/core';
import { HttpClientModule, HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { AuthenticationService } from '../services/authentication.service';
import { Card } from '../models/card.model';
import { UserCards } from '../models/user_cards.model';
import { Pack } from '../models/pack.model';
import {Turn} from "../models/turn.model";
import {Trash} from "../models/trash.model";
import {UsersInChat} from "../models/users_in_chat.model";

@Injectable()
export class CardService {

    // URLs to web api
    public token: string;
    private domain = 'http://localhost:8085/';
    private getCardListUrl = 'card_list';
    private addUserCardsUrl = 'add_user_cards';
    private getUserCardsUrl = 'get_user_cards';
    private getUserCardsCountUrl = 'get_user_cards_count';
    private updatePackUrl = 'update_pack';
    private getPackUrl = 'get_pack';
    private addTurnUrl = 'add_turn';
    private getTurnUrl = 'get_turn';
    private getCardInfoUrl = 'get_card_info';
    private getTrashCountUrl = 'get_trash_count';
    private pushCardsUrl = 'push_cards';

    constructor(
        private http: HttpClient,
        private authenticationService: AuthenticationService

    ) {
    	// set token if saved in local storage
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
    }

    cardList(type) {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token});
        const url = `${this.domain}${this.getCardListUrl}`;
        return this.http.get<Card>(url, {headers: headers, params: {type : type}})
            .map((response) => response);
    }

    getUserCards(data) {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token});
      const url = `${this.domain}${this.getUserCardsUrl}`;
      return this.http.get<UserCards>(url, {headers: headers, params: data})
        .map((response) => response);
    }

    addUserCards(data) {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token});
      const url = `${this.domain}${this.addUserCardsUrl}`;
      return this.http.post(url, data, {headers: headers})
        .map(response => response);
    }

    getUserCardsCount(data) {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token});
      const url = `${this.domain}${this.getUserCardsCountUrl}`;
      return this.http.get<UsersInChat>(url, {headers: headers, params: data})
        .map((response) => response);
    }

    updatePack(data) {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token});
      const url = `${this.domain}${this.updatePackUrl}`;
      return this.http.post(url, data, {headers: headers})
        .map(response => response);
    }

    getPack(data) {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token});
      const url = `${this.domain}${this.getPackUrl}`;
      return this.http.get<UserCards>(url, {headers: headers, params: data})
        .map((response) => response);
    }

    addTurn(data) {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token});
      const url = `${this.domain}${this.addTurnUrl}`;
      return this.http.post(url, data, {headers: headers})
        .map(response => response);
    }

    getTurns(data) {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token});
      const url = `${this.domain}${this.getTurnUrl}`;
      return this.http.get<Turn>(url, {headers: headers, params: data})
        .map((response) => response);
    }

    getCardInfo(card) {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token});
      const url = `${this.domain}${this.getCardInfoUrl}`;
      return this.http.get<Card>(url, {headers: headers, params: {card: card}})
        .map((response) => response);
    }

    getTrashCount(data) {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token});
      const url = `${this.domain}${this.getTrashCountUrl}`;
      return this.http.get<Trash>(url, {headers: headers, params: data})
        .map((response) => response);
    }

    pushCards(data) {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token});
      const url = `${this.domain}${this.pushCardsUrl}`;
      return this.http.post(url, data, {headers: headers})
        .map(response => response);
    }

}
