import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { TableService } from '../../services/table.service';
import { CardService } from '../../services/card.service';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {

  tableId: string;
  newGameForm: FormGroup;
  games: any = ['Дурак'];
  game: string;

  constructor(
    private route: ActivatedRoute,
    private tableService: TableService,
    private cardService: CardService
  ) { }

  ngOnInit() {
  	this.route.params.subscribe(params => {
			// console.log(params.id);
      this.tableId = params.id;
			this.getTableInfo(params.id);
		});
    this.getCardList();
    this.createForm();
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

}
