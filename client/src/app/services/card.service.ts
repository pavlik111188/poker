import { Injectable } from '@angular/core';
import { HttpClientModule, HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { AuthenticationService } from '../services/authentication.service';
import { Card } from '../models/card.model';
import { UserCards } from '../models/user_cards.model';

@Injectable()
export class CardService {

    // URLs to web api
    public token: string;
    private domain = 'http://localhost:8085/';
    private getCardListUrl = 'card_list';
    private addUserCardsUrl = 'add_user_cards';
    private getUserCardsUrl = 'get_user_cards';

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

}
