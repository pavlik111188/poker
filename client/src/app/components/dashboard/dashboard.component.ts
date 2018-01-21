import {Component, OnChanges, SimpleChanges, Input, OnInit} from '@angular/core';
import { TableService } from '../../services/table.service';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from "@angular/router";
import { patternValidator } from '../../shared/pattern-validator';
import { GameService } from '../../services/game.service';
import {FlashMessagesService} from "angular2-flash-messages";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

	tableName: string;
  tableList = [];
  newTableForm: FormGroup;
  loading: boolean = false;
  queryParams: {
      [k: string]: any;
  };
  chat: string = 'General';
  currentUserEmail: string = '';
  games: any = [];

  constructor(
    private tableService: TableService,
    private router: Router,
    private flashMessagesService: FlashMessagesService,
    private gameService: GameService) { }

  /*ngOnChanges(changes: SimpleChanges) {

  }*/

  ngOnInit() {
    this.getTableList();
    this.createForm();
    this.currentUserEmail = localStorage.getItem('user_email');
    // console.log(this.currentUserEmail);
    this.getGameList();
  }

  newTable() {
    this.loading = true;
  	this.tableService.createNewTable(this.newTableForm.value.name, this.newTableForm.value.game).subscribe((res) => {
  		if (res['success']) {
        this.getTableList();
        this.createForm();
        this.loading = false;
        this.flashMessagesService.show('Стол успешно добавлен', {cssClass: 'alert-success', timeout: 3000});
      }
  	},
  	(error) => {
      this.loading = false;
      this.flashMessagesService.show('Стол не добавлен', {cssClass: 'alert-danger', timeout: 3000});
  		console.log(error);
  	});
  }

  getTableList() {
    this.tableService.tableList().subscribe((res) => {
      if (res['success']) {
        this.tableList = res['table_list'];
        console.log(this.tableList);
      } else {

      }
    });
  }

  private createForm() {
      this.newTableForm = new FormGroup({
        name: new FormControl('', [Validators.required, Validators.minLength(3)]),
        game: new FormControl('', [Validators.required])
      });
  }

  goToTable(id) {
    this.router.navigate(['/table'], { queryParams: { table_id: id } });
    window.history.pushState('','','table');
  }

  removeTable(id, email) {
    this.tableService.removeTable({id: id, email: email}).subscribe((res) => {
      if (res['success']) {
        console.log(res['msg']);
        this.getTableList();
      } else {
        console.log(res['msg']);
      }
    },
    (error) => {
      console.log(error);
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

}
