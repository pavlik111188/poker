import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';
import {ResizeProvider} from '../../providers/resize-provider';
import {ChairService} from '../../services/chair.service';
import {ChatService} from '../../services/chat.service';

@Component({
  selector: 'app-playground',
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.css']
})
export class PlaygroundComponent implements OnInit {

  @Input('game') game: string;
  @Input('room') room: string;

  @Output() start_game: EventEmitter<any> = new EventEmitter();

  chairs: object[];
  users: object[];
  styles: string = "board-container";
  rotatePlayer: string = "";
  top: number = 0;
  left: number = 0;
  zoom: number = 1;
  zoomX: number = 1;
  zoomY: number = 1;
  myChair: string;
  user_email: string = localStorage.getItem('user_email');

  constructor(
    private chairService: ChairService,
    private chatService: ChatService) { }

  ngOnInit() {
    ResizeProvider.resizeAction.subscribe((isLandscape: boolean)=>{
      this.resizeActionHandler(isLandscape);
    });
    this.resizeActionHandler(null);

    setTimeout(()=>{
      this.resizeActionHandler(null);
    },3000);
    this.chairService.chairList().subscribe((res) => {
      if (res['chairs_list']) {
        this.chairs = res['chairs_list'];
      }
    },
    (err) => {
      console.log(err);
    });
    this.getUsersInChat(this.room);
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

  chooseChair(id) {
    if (this.myChair.length < 1) {
      this.addUserToChat(id);
      this.start_game.emit(id);
    }
  }

  getUsersInChat(room: String) {
    this.chatService.getUsersInChat(room).subscribe((res) => {
      if((res['success']) && (res['users'].length > 0)) {
        this.users = res['users'];
        // console.log(res);
        for (var _i = 0; _i < this.users.length; _i++) {
          var user = this.users[_i];
          if (this.user_email == user['email']) {
            this.myChair = user['chair'];
            this.start_game.emit(this.myChair);
          }
        }
      }
    },
    (err) =>{
      console.log(err);
    });
  }

  addUserToChat(id) {
    this.chatService.addUserToChat({room: this.room, chair: id}).subscribe((res) => {
      console.log(res);
    },
      (err) => {
      console.log(err);
      });
  }

  findInArray(chair) {
    let res = false;
    for (var _i = 0; _i < this.users.length; _i++) {
      var user = this.users[_i];
      if (user['chair'] == chair) {
        res = true;
      }
    }
    return res;
  }

}
