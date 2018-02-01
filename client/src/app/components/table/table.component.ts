import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { TableService } from '../../services/table.service';
import { CardService } from '../../services/card.service';
import { ChatService } from '../../services/chat.service';
import { GameService } from '../../services/game.service';
import 'rxjs/add/operator/map';
import { FlashMessagesService } from 'angular2-flash-messages';
import {AuthenticationService} from "../../services/authentication.service";

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {

  tableId: string;
  newGameForm: FormGroup;
  games: any = [];
  game: string;
  usersInTable: number;
  start_game: boolean = false;

  isLogged: boolean = false;
  currentUser: string = '';

  constructor(
    private route: ActivatedRoute,
    private tableService: TableService,
    private flashMessagesService: FlashMessagesService,
    private gameService: GameService,
    private authenticationService: AuthenticationService
  ) {
    if(JSON.parse(localStorage.getItem('currentUser'))) {
      this.isLogged = true;
      if(localStorage.getItem('user_name')) {
        this.currentUser = localStorage.getItem('user_name');
      } else {
        this.authenticationService.getUserInfo().subscribe(res => {
          this.currentUser = res;
        });
      }

    } else {
      this.logout();
      this.isLogged = false;
    }
  }

  ngOnInit() {
  	this.route.params.subscribe(params => {
			this.tableId = params.id;
      this.getTableInfo(params.id);
		});
  }

  getTableInfo(id: string) {
  	this.tableService.getTableInfo(id).subscribe((res) => {
  		if (res['success']) {
  		  let tableInfo = res['table_info'];
  		  this.game = tableInfo.game;
      }
  	});
  }

  countUsers(event) {
    this.usersInTable = event;
  }

  isStartGame(event) {
    this.start_game = true;
    // this.start_game = event;
    this.getTableInfo(this.tableId);
  }

  logout() {
    this.authenticationService.logout();
  }

}
