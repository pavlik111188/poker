import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-playground',
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.css']
})
export class PlaygroundComponent implements OnInit {

  @Input('game') game: string;

  @Output() start_game: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

}
