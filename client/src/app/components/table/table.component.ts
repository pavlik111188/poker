import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { TableService } from '../../services/table.service';
import { CardService } from '../../services/card.service';
import { ChatService } from '../../services/chat.service';
import { GameService } from '../../services/game.service';
import 'rxjs/add/operator/map';

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

  constructor(
    private route: ActivatedRoute,
    private tableService: TableService,
    private cardService: CardService,
    private gameService: GameService
  ) { }

  ngOnInit() {
  	this.route.params.subscribe(params => {
			// console.log(params.id);
      this.tableId = params.id;
			this.getTableInfo(params.id);
		});
    this.getCardList();
    this.createForm();
    this.getGameList();
  }

  getTableInfo(id: string) {
  	this.tableService.getTableInfo(id).subscribe((res) => {
  		// console.log(res);
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

  private createForm() {
      this.newGameForm = new FormGroup({
        game: new FormControl('', [Validators.required])
      });
  }

  getGameList() {
    this.gameService.gameList().subscribe((res) => {
        // console.log(res);
        if (res['success']) {
          this.games = res['game_list'];
        }
      },
      (err) => {
        console.log(err);
      });
  }

  countUsers(event) {
    this.usersInTable = event;
  }

  newGame() {
    this.game = this.newGameForm.controls.game.value.name;
    if (this.usersInTable > 1) {
      console.log(this.game);
    }
    // if (this.newGameForm.controls['game'])
  }

}
