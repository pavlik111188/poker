import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-playground',
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.css']
})
export class PlaygroundComponent implements OnInit {

  @Input('game') game: string;

  @Output() start_game: EventEmitter<any> = new EventEmitter();

  chairs: any = ['chair1','chair2','chair3','chair4','chair5','chair6'];

  constructor() { }

  ngOnInit() {
  }

}
