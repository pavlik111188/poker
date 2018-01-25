import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';

import {BehaviorSubject} from 'rxjs/BehaviorSubject';

import { PositionModel } from '../../models/position-model';
import {ResizeProvider} from "../../providers/resize-provider";
import {RequestModel} from "../../models/request-model";

@Component({
  selector: 'app-playground',
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.css']
})
export class PlaygroundComponent implements OnInit {

  @Input('game') game: string;

  @Output() start_game: EventEmitter<any> = new EventEmitter();

  chairs: any = ['chair1','chair2','chair3','chair4','chair5','chair6'];

  styles: string = "board-container";
  rotatePlayer: string = "";

  top: number = 0;
  left: number = 0;
  zoom: number = 1;
  zoomX: number = 1;
  zoomY: number = 1;

  constructor() { }

  ngOnInit() {
    ResizeProvider.resizeAction.subscribe((isLandscape: boolean)=>{
      this.resizeActionHandler(isLandscape);
    });
    this.resizeActionHandler(null);

    setTimeout(()=>{
      this.resizeActionHandler(null);
    },3000);
  }

  /******************* BOARD UTILS **********************/
  /*boardActionHandler(data: RequestModel) {
    if (data && data.type == REQUEST_UPDATE && data.data["action"] && data.data["action"] == "start-game") {
      this.updateGameController();
    }
  }*/

  /*updateGameController() {
    if (++this.animStackIndex >= this.animStack.length) {
      this.animStackIndex = 0;
    }

    let action = this.animStack[this.animStackIndex];
    // ApiProvider.animAction.next(action["model"]);
    setTimeout(()=>{
      this.updateGameController();
    }, action["duration"]);
  }*/

  /******************** RESIZE UTILS **********************/
  resizeActionHandler(isLandscape: boolean) {
    let w: number = window.innerWidth;
    let h: number = window.innerHeight;

    if (window.orientation == undefined) {
      // desktop detect
      isLandscape = (h/w < 1.3);
    } else {
      // mobile tablet
      let o: string = window.orientation + "";
      isLandscape = (o.indexOf("90")>=0);
    }
    this.boardPosition(w, h, isLandscape);
  }

  boardPosition(w: number, h: number, isLandscape: boolean) {
    if (isLandscape) {
      this.styles = "board-container";
      this.rotatePlayer = "";
      this.top = 0;
      this.left = 0;
      this.zoomX = w / 800;
      this.zoomY = h / ( (h < 500) ? 640 : 600);
    } else {
      this.styles = "board-container rotate";
      this.rotatePlayer = "rotate";
      this.top = 0;
      this.left = -100;
      this.zoomX = h / 800;
      this.zoomY = w / 600;
    }

    ResizeProvider.rotationAction.next(this.rotatePlayer);
    this.zoom = (this.zoomX < this.zoomY) ? this.zoomX : this.zoomY;

    let dist: number = (h - 600 * this.zoom) * 0.5 / this.zoom;
    if (dist >= 100) {
      this.top = dist;
    } else {
      this.left = (w - 800 * this.zoom) * 0.5 / this.zoom;
    }
  }

}
