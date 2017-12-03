import { Component, OnChanges, SimpleChanges, Input } from '@angular/core';
import { TableService } from '../../services/table.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnChanges {

	tableName: string;

  constructor(private tableService: TableService) { }

  ngOnChanges(changes: SimpleChanges) {
    
  }

  ngOnInit() {
  	
  }

  newTable() {
  	this.tableService.createNewTable(this.tableName).subscribe((res) => {
  		console.log(res);
  	},
  	(error) => {
  		console.log(error);
  	});
  }

}
