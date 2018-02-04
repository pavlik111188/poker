import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import {ResizeProvider} from '../../providers/resize-provider';
import {ChairService} from '../../services/chair.service';
import {ChatService} from '../../services/chat.service';
import {CardService} from '../../services/card.service';
import {TableService} from '../../services/table.service';
import {GameService} from '../../services/game.service';
import * as io from "socket.io-client";
import { FlashMessagesService } from 'angular2-flash-messages';
import {AuthenticationService} from "../../services/authentication.service";

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
  usersCardsCount = [];
  styles: string = "board-container";
  rotatePlayer: string = "";
  top: number = 0;
  left: number = 0;
  zoom: number = 1;
  zoomX: number = 1;
  zoomY: number = 1;
  myChair: string = '';
  user_email: string = localStorage.getItem('user_email');
  user_name: string = localStorage.getItem('user_name');
  socket = io('http://localhost:4000');
  tableOwner: string;
  userCanStart: boolean = false;
  startedGame: boolean = false;
  cards: any;
  trump: string;
  myCards: any;

  constructor(
    private chairService: ChairService,
    private tableService: TableService,
    private cardService: CardService,
    private gameService: GameService,
    private flashMessagesService: FlashMessagesService,
    private authenticationService: AuthenticationService,
    private chatService: ChatService) {

  }

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

    this.socket.on('new-user-in-chat', (data) => {
      if (data.name == this.room) {
        setTimeout(() => {
          this.getUsersInChat(data.name);
          this.canStart();
        }, 1500);

      }
    });

    this.socket.on('start-new-game', (data) => {
      if (data.room == this.room) {
        setTimeout(() => {
          this.getCardList();
          this.getStartedGame();
        }, 1500);
      }
    });

    this.tableService.getTableInfo(this.room).subscribe((res) => {
      this.tableOwner = res['table_info']['ownerEmail'];
      this.canStart();
    });

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

  chooseChair(id, position) {
    if (this.myChair.length < 1) {
      this.addUserToChat(id, position);
      this.start_game.emit(id);
    }
  }

  getUsersInChat(room: String) {
    this.chatService.getUsersInChat(room).subscribe((res) => {
      if((res['success']) && (res['users'].length > 0)) {
        this.users = res['users'];
        for (var _i = 0; _i < this.users.length; _i++) {
          var user = this.users[_i];
          // this.users
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

  addUserToChat(id, position) {
    this.chatService.addUserToChat({room: this.room, chair: id, position: position, name: this.user_name}).subscribe((res) => {
      if (res['success']) {
        this.getUsersInChat(this.room);
      }
    },
      (err) => {
      console.log(err);
      });
  }

  findInArray(chair) {
    let res = false;
    if (this.users) {
      for (var _i = 0; _i < this.users.length; _i++) {
        var user = this.users[_i];
        if (user['chair'] == chair) {
          res = true;
        }
      }
    }
    return res;
  }

  getUserByChair(chair) {
    console.log(this.users);
    let res;
    for (var _i = 0; _i < this.users.length; _i++) {
      var user = this.users[_i];
      if (user['chair'] == chair) {
        res = user['email'];
      }
    }
    return res;
  }

  canStart() {
    if (this.users && this.tableOwner && this.room) {
      this.getStartedGame();
    }
  }

  getStartedGame() {
    this.gameService.getStartedGame({table: this.room}).subscribe((res) => {
        if (res) {
          if (res['success']) {
            this.startedGame = true;
            this.trump = res['game']['trump'];
            this.getCardList();
          }
          if (this.users.length > 1 && this.tableOwner == this.user_email && !this.startedGame)
            this.userCanStart = true;
        }
      },
      (err) => {
        console.log(err);
        if (this.users.length > 1 && this.tableOwner == this.user_email && !this.startedGame)
          this.userCanStart = true;
      });
  }

  getCardList() {
    const type = this.game == 'Дурак' ? 1 : 0;
    if (!this.startedGame) {
      this.cardService.cardList(type).subscribe((res) => {
          if (res['success']) {
            this.distributionCards(res['card_list']);
          }
        },
        (err) => {
          console.log(err);
        });
    } else {
      this.getUserCards();
    }
  }

  distributionCards(card_list) {
    this.cards = card_list;
    for (let j = 0; j < this.users.length; j++ ) {
      let userCards = [];
      for (let i = 0; i < 6; i++) {
        let rand = Math.floor(Math.random() * this.cards.length);
        userCards.push(this.cards[rand].name);
        this.cards.splice(rand, 1);
      }
      this.cardService.addUserCards({
        game: this.game,
        table: this.room,
        user: this.users[j]['email'],
        cards: userCards
      }).subscribe((res) => {
          this.startedGame = true;
          this.userCanStart = false;
          this.getUserCards();
        },
        (err) => {
          console.log(err);
        });
    }

    this.addStartedGame();

  }

  newGame() {
    this.getCardList();
  }

  addStartedGame() {
    let key = Math.floor(Math.random() * this.cards.length);
    this.gameService.addStartedGame({game: this.game, table: this.room, trump: this.cards[key].suit}).subscribe((res) => {
      if (res['success']) {
        this.startedGame = true;
        this.socket.emit('start-new-game', {room: this.room});
        this.trump = this.cards[key].suit;
        this.getCardList();
        this.getUserCards();
      }
    });
  }

  getUserCards() {
    this.cardService.getUserCards({
      game: this.game,
      table: this.room,
      user: this.user_email
    }).subscribe((res) => {
      if (res['success'])
        this.myCards = res['cards'];
      if (this.startedGame) {
        for (let j = 0; j < this.users.length; j++ ) {
          let user = this.users[j];
          this.cardService.getUserCardsCount({game: this.game, table: this.room, user: user['email']}).subscribe((res) => {
            this.users[j]['cards_count'] = res['cards_count'];
            console.log(this.users[j]);
          });
        }
        // setTimeout(() => {

        // }, 1000);
      }
    });
  }

  getUserName(email: string) {
    this.authenticationService.getUserName(email).subscribe((res) => {
      return res.toString();
    });
  }

  getUserCardsCount(user) {
    let res = this.cardService.getUserCardsCount({game: this.game, table: this.room, user: user}).subscribe((res) => {
      // if(res['success']) {
        return res['cards_count'];
      // }
    });
    return res;
  }

  getArray(n: number) {
    let arr = [];
    for (let i = 0; i < n; i ++) {
      arr.push('blue_b');
    }
    return arr;
  }

}
