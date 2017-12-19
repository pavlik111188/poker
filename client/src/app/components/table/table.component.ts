import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TableService } from '../../services/table.service';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {

  constructor(private route: ActivatedRoute, private tableService: TableService) { }

  ngOnInit() {
  	this.route.params.subscribe(params => {
			console.log(params.id);
			this.getTableInfo(params.id);
		});
  }

  getTableInfo(id: string) {
  	this.tableService.getTableInfo(id).subscribe((res) => {
  		console.log(res);
  	});
  }

}
