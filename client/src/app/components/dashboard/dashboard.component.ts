import { Component, OnChanges, SimpleChanges, Input } from '@angular/core';
import { TableService } from '../../services/table.service';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { patternValidator } from '../../shared/pattern-validator';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnChanges {

	tableName: string;
  tableList = [];
  newTableForm: FormGroup;
  loading: boolean = false;


  constructor(private tableService: TableService) { }

  ngOnChanges(changes: SimpleChanges) {
    
  }

  ngOnInit() {
    this.getTableList();
    this.createForm(); 	
  }

  newTable() {
    this.loading = true;
  	this.tableService.createNewTable(this.newTableForm.value.name).subscribe((res) => {
  		if (res['success']) {
        this.getTableList();
        this.createForm();
        this.loading = false;
      }
      console.log(res);
  	},
  	(error) => {
      this.loading = false;
  		console.log(error);
  	});
  }

  getTableList() {
    this.tableService.tableList().subscribe((res) => {
      if (res['success']) {
        this.tableList = res['table_list'];
      } else {

      }
    });
  }

  private createForm() {
      this.newTableForm = new FormGroup({
        name: new FormControl('', [Validators.required, Validators.minLength(3)]) 
      });
  }

}
