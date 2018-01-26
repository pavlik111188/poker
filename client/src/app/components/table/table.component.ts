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

  constructor(
    private route: ActivatedRoute,
    private tableService: TableService,
    private cardService: CardService,
    private flashMessagesService: FlashMessagesService,
    private gameService: GameService
  ) { }

  ngOnInit() {
  	this.route.params.subscribe(params => {
			this.tableId = params.id;
      this.getTableInfo(params.id);
		});
    this.getCardList();
  }

  getTableInfo(id: string) {
  	this.tableService.getTableInfo(id).subscribe((res) => {
  		if (res['success']) {
  		  let tableInfo = res['table_info'];
  		  this.game = tableInfo.game;
      }
  	  console.log(res);
  	});
  }

  getCardList() {
    this.cardService.cardList().subscribe((res) => {
      // console.log(res);
    },
    (err) => {
      console.log(err);
    });
  }

  countUsers(event) {
    this.usersInTable = event;
  }

  isStartGame(event) {
    console.log(event);
    this.start_game = true;
    // this.start_game = event;
    this.getTableInfo(this.tableId);
  }

}
