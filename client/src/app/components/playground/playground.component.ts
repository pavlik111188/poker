import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { Router } from '@angular/router';
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
  pack: any;
  pack_count: number;
  allCards: any;
  lowestTrumpResult: any;
  showLowestTrump: boolean = false;
  userTurn: string;
  gamePart: number = 1;
  showCardsOnTable: boolean = false;
  turns: any = [];
  moveType: string;
  lastTurn: any;
  showSkip: boolean = false;
  showAbandon: boolean = false;
  trashCount: number;
  turnCards: any = [];

  constructor(
    private chairService: ChairService,
    private tableService: TableService,
    private cardService: CardService,
    private gameService: GameService,
    private flashMessagesService: FlashMessagesService,
    private authenticationService: AuthenticationService,
    private chatService: ChatService,
    private route: Router) {

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

    this.socket.on('update-table-game', (data) => {
      if (data.room == this.room) {
        if (data.action == 'choose-chair') {
          // this.canStart();
        }
        if (data.action == 'update-pack') {
          this.decode(data.cards);
        }
        if (data.action == 'get-lowest-trump') {
          if (!this.lowestTrumpResult)
            this.getLowestTrumpResult(data.result);
        }
        if (data.action == 'turn') {
          this.getUserCards();
          if (data.user !== this.user_email) {
            this.getParts();
            this.userTurn = data.whom;
          }
        }
      }
    });

    this.socket.on('remove-table', (data) => {
      if (data.id == this.room)
        this.route.navigate(['/dashboard']);

    });

    this.tableService.getTableInfo(this.room).subscribe((res) => {
      this.tableOwner = res['table_info']['ownerEmail'];
      this.canStart();
    });

    // console.log(this.testEncode("NWE5M2Q3Y2YxZjAwYTIwZmZjZmQwNjE3Zm1XKDlmMyU2YkExamhTSU5WVjNvdVlZWUdiMT0hditNU0E3eUhCQg==W3siX2lkIjoiNWE1Mjg1MWFmMjE1NjAzNjdkNmIzNDIxIiwibmFtZSI6IjZzIiwicmFuayI6NSwic3VpdCI6InNwYWRlIn0seyJfaWQiOiI1YTUyODlkMmYyMTU2MDM2N2Q2YjM2MTEiLCJuYW1lIjoiN2MiLCJyYW5rIjo2LCJzdWl0IjoiY2x1YiJ9LHsiX2lkIjoiNWE1Mjg3YzNmMjE1NjAzNjdkNmIzNTJjIiwibmFtZSI6IjhkIiwicmFuayI6Nywic3VpdCI6ImRpYW1vbmQifSx7Il9pZCI6IjVhNTI4N2QzZjIxNTYwMzY3ZDZiMzUzNSIsIm5hbWUiOiI5ZCIsInJhbmsiOjgsInN1aXQiOiJkaWFtb25kIn0seyJfaWQiOiI1YTUyODViZmYyMTU2MDM2N2Q2YjM0NjAiLCJuYW1lIjoiMTBzIiwicmFuayI6OSwic3VpdCI6InNwYWRlIn0seyJfaWQiOiI1YTUyODdlZWYyMTU2MDM2N2Q2YjM1NDIiLCJuYW1lIjoiMTBkIiwicmFuayI6OSwic3VpdCI6ImRpYW1vbmQifSx7Il9pZCI6IjVhNTI4OTI4ZjIxNTYwMzY3ZDZiMzVjNCIsIm5hbWUiOiIxMGgiLCJyYW5rIjo5LCJzdWl0IjoiaGVhcnQifSx7Il9pZCI6IjVhNTI4YTFiZjIxNTYwMzY3ZDZiMzYzMCIsIm5hbWUiOiJqYyIsInJhbmsiOjEwLCJzdWl0IjoiY2x1YiJ9LHsiX2lkIjoiNWE1Mjg2NjNmMjE1NjAzNjdkNmIzNDlkIiwibmFtZSI6InFzIiwicmFuayI6MTEsInN1aXQiOiJzcGFkZSJ9LHsiX2lkIjoiNWE1Mjg4MzJmMjE1NjAzNjdkNmIzNTViIiwibmFtZSI6InFkIiwicmFuayI6MTEsInN1aXQiOiJkaWFtb25kIn0seyJfaWQiOiI1YTUyOGEyZGYyMTU2MDM2N2Q2YjM2M2EiLCJuYW1lIjoicWMiLCJyYW5rIjoxMSwic3VpdCI6ImNsdWIifSx7Il9pZCI6IjVhNTI4NjhhZjIxNTYwMzY3ZDZiMzRhZSIsIm5hbWUiOiJrcyIsInJhbmsiOjEyLCJzdWl0Ijoic3BhZGUifSx7Il9pZCI6IjVhNTI4OTY1ZjIxNTYwMzY3ZDZiMzVkZiIsIm5hbWUiOiJraCIsInJhbmsiOjEyLCJzdWl0IjoiaGVhcnQifSx7Il9pZCI6IjVhNTI4YTNlZjIxNTYwMzY3ZDZiMzY0MSIsIm5hbWUiOiJrYyIsInJhbmsiOjEyLCJzdWl0IjoiY2x1YiJ9LHsiX2lkIjoiNWE1Mjg2OWZmMjE1NjAzNjdkNmIzNGI2IiwibmFtZSI6ImFzIiwicmFuayI6MTMsInN1aXQiOiJzcGFkZSJ9LHsiX2lkIjoiNWE1Mjg4NTFmMjE1NjAzNjdkNmIzNTZhIiwibmFtZSI6ImFkIiwicmFuayI6MTMsInN1aXQiOiJkaWFtb25kIn0seyJfaWQiOiI1YTUyODk3NWYyMTU2MDM2N2Q2YjM1ZTgiLCJuYW1lIjoiYWgiLCJyYW5rIjoxMywic3VpdCI6ImhlYXJ0In0seyJfaWQiOiI1YTUyOGE0OWYyMTU2MDM2N2Q2YjM2NDciLCJuYW1lIjoiYWMiLCJyYW5rIjoxMywic3VpdCI6ImNsdWIifV0="));

  }

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

  chooseChair(id, position, chair_number) {
    if (this.myChair.length < 1) {
      this.addUserToChat(id, position, chair_number);
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
        this.canStart();
      }
    },
    (err) =>{
      console.log(err);
    });
  }

  addUserToChat(id, position, chair_number) {
    this.chatService.addUserToChat({room: this.room, chair: id, position: position, name: this.user_name, chair_number: chair_number}).subscribe((res) => {
      if (res['success']) {
        this.getUsersInChat(this.room);
        this.socket.emit('update-table-game', {room: this.room, action: 'choose-chair'});
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
            this.getParts();
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
            this.allCards = res['card_list'];
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
        userCards.push({rank: this.cards[rand].rank, card: this.cards[rand].name});
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
          if (j == this.users.length - 1) {
            this.getUserCards();
          }
        },
        (err) => {
          console.log(err);
        });
    }
    let encodeCards = this.encode(JSON.stringify(this.cards));
    this.socket.emit('update-table-game', {game: this.game, room: this.room, cards: encodeCards, action: 'update-pack'});
    this.addStartedGame();

  }

  encode(str) {
    let encTable = btoa(this.room);
    let encCardsArray = btoa(str);
    let customStr = btoa('fmW(9f3%6bA1jhSINVV3ouYYYGb1=!v+MSA7yHBB');
    let encRes = encTable + customStr + encCardsArray;
    return encRes;
  }

  decode(str) {
    let encTable = btoa(this.room);
    let customStr = btoa('fmW(9f3%6bA1jhSINVV3ouYYYGb1=!v+MSA7yHBB');
    let decRes = atob(str.slice(encTable.length + customStr.length));
    this.pack = JSON.parse(decRes);
    this.pack_count = this.pack.length;
  }

  testEncode(str) {
    let encTable = btoa(this.room);
    let customStr = btoa('fmW(9f3%6bA1jhSINVV3ouYYYGb1=!v+MSA7yHBB');
    let encCardsArray = btoa('[{"_id":"5a528851f21560367d6b356a","name":"ad","rank":13,"suit":"diamond"},{"_id":"5a528975f21560367d6b35e8","name":"ah","rank":13,"suit":"heart"},{"_id":"5a528a49f21560367d6b3647","name":"ac","rank":13,"suit":"club"}]');
    let decRes = atob(str.slice(encTable.length + customStr.length));
    let encRes = encTable + customStr + encCardsArray;

    return {decRes: decRes, encRes: encRes};
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
      if (res['success']) {
          this.myCards = res['cards'];
      }
      if (this.startedGame) {
        for (let j = 0; j < this.users.length; j++ ) {
          let user = this.users[j];
          this.cardService.getUserCardsCount({game: this.game, table: this.room, user: user['email']}).subscribe((res) => {
            this.users[j]['cards_count'] = res['cards_count'];
          });
        }
        // this.getParts();
        if (!this.pack) {
          this.getPack();
        }
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

  updatePack(cards) {
    this.cardService.updatePack({game: this.game, table: this.room, cards: cards}).subscribe((res) => {
      this.pack = cards;
    });
  }

  getArray(n: number) {
    let arr = [];
    for (let i = 0; i < n; i ++) {
      arr.push('blue_b');
    }
    return arr;
  }

  getPack() {
    this.cardService.getPack({room: this.room}).subscribe((res) => {
      this.decode(res['pack']);
      this.getParts();
    });
  }

  getLowestTrump() {
    setTimeout(() => {
      this.moveType = 'attack';
      let trump = this.trump.charAt(0);
      this.socket.emit('update-table-game', {room: this.room, action: 'get-lowest-trump', user: this.user_email, trump: trump});
    }, 2500);
  }

  getLowestTrumpResult(data) {
    if (data.card) {
      let pos;
      for (let user of this.users) {
        if (data.user == user['email']) {
          pos = user['position'];
        }
      }
      this.lowestTrumpResult = {card: data.card, position: pos};
      this.userTurn = data.user;
      this.showLowestTrump = true;
      setTimeout(() => {
        this.showLowestTrump = false;
      }, 2500);

    } else {
      this.startedGame = false;
      this.getCardList();
    }
  }

  getParts() {
    this.getAllCards();
    this.gameService.getGamePart({room: this.room, ended: false}).subscribe((res) => {
      console.log(res);
      if (res['success'] && res['parts']['turns']) {
        let part = res['parts'];
        let lastElId = part.turns.length - 1;
        this.turns = part.turns;
        let turnsRes = [];
        for (let turn of this.turns) {
          if (turn['move_type'] == 'defend' || turn['move_type'] == 'attack') {
            turnsRes.push(turn);
          }
        }
        this.turnCards = turnsRes;
        if (res['next_user']) {
          this.userTurn = res['next_user'];
        } else {
          this.userTurn = this.turns[lastElId].whom;
        }
        this.moveType = (this.turns[lastElId].move_type == 'attack') ? 'defend' : 'attack';
        this.lastTurn = this.turns[lastElId];
        this.gamePart = part.part;
        if (this.turns[lastElId].move_type == 'defend') {
          // console.log(this.lastTurn);
        }
        if (this.userTurn == this.user_email && this.turns && this.moveType == 'attack') {
          this.showSkip = true;
        }
        if (this.userTurn == this.user_email && this.turns && this.moveType == 'defend') {
          this.showAbandon = true;
        }
        this.getTrashCount();
      } else if (res['lastTurn']) {
        this.gamePart = res['part'] + 1;
        this.turns = [];
        this.turnCards = [];
        this.userTurn = res['lastTurn']['next_user'];
        this.moveType = 'attack';
        this.getTrashCount();
        if (this.myCards.length < 6)
          this.pushCards();
      } else {
        this.getLowestTrump();
      }
    });
  }

  getAllCards() {
    const type = this.game == 'Дурак' ? 1 : 0;
    this.cardService.cardList(type).subscribe((res) => {
        if (res['success']) {
          this.allCards = res['card_list'];
        }
      },
      (err) => {
        console.log(err);
      });
  }

  turn(card, card_rank, type) {
    // attack (заход), defend (побить), abandon (принять), skip (пропускать)
    if (this.userTurn == this.user_email) {
      if (!type) {
        if (this.moveType == 'defend') {
          if (this.compareCards(this.lastTurn.card, card)) {
            this.showAbandon = false;
            this.addGamePart(this.gamePart, this.game, this.room, {user: this.user_email, card: card, card_rank: card_rank, whom: '', move_type: this.moveType}, false);
          }
        }
        if (this.moveType == 'attack') {
          let next_user;
          for (let i = 0; i < this.users.length; i++) {
            if (this.users[i]['email'] == this.user_email) {
              if (i == this.users.length - 1) {
                next_user = this.users[0];
              } else {
                next_user = this.users[i+1];
              }
              break;
            }
          }
          if (next_user.cards_count > 0) {
            this.showSkip = false;
            if (this.turns.length > 0) {
             this.canAttack(card, card_rank);
            } else {
             this.addGamePart(this.gamePart, this.game, this.room, {user: this.user_email, card: card, card_rank: card_rank, whom: '', move_type: this.moveType}, false);
            }
          } else {
            this.addGamePart(this.gamePart, this.game, this.room, {user: this.user_email, card: '', card_rank: 0, whom: '', move_type: 'skip'}, false);
          }
        }
      } else {
        if (type == 'skip') {
          this.showSkip = false;
          this.addGamePart(this.gamePart, this.game, this.room, {user: this.user_email, card: '', card_rank: 0, whom: '', move_type: type}, false);
        }
        if (type == 'abandon') {
          this.showAbandon = false;
          this.addGamePart(this.gamePart, this.game, this.room, {user: this.user_email, card: '', card_rank: 0, whom: '', move_type: type, turns: this.turns}, false);
        }
      }
    }
  }

  compareCards(attack, deffend) {
    let at = this.getCardInfo(attack)[0];
    let def = this.getCardInfo(deffend)[0];
    if ((at.suit == def.suit) && (at.rank < def.rank)) {
      return true;
    } else {
      if (def.suit == this.trump) {
        return true;
      } else {
        return false;
      }
    }
  }

  getCardInfo(card) {
    return this.allCards.filter(x => x.name === card);
  }

  addGamePart(part, game, room, turns, ended, notFirst=false) {
    this.gameService.addGamePart(
      {
        part: part,
        game: game,
        room: room,
        turns: turns,
        ended: ended,
        notFirst: notFirst
      }).subscribe((res) => {
      if (res['success']) {

        this.userTurn = res['next_user'];
        this.showCardsOnTable = true;
        this.socket.emit('update-table-game', {room: room, action: 'turn', user: this.user_email, whom: this.userTurn, move_type: res['move_type']});
        this.getUserCards();
        this.getParts();
      }
    });
  }

  canAttack(card, rank) {
    let res = this.turns.filter(x => x.card_rank === rank);
    let whom = this.turns.filter(x => x.move_type === 'defend');
    if (res.length > 0) {
      this.addGamePart(this.gamePart, this.game, this.room, {user: this.user_email, card: card, card_rank: rank, whom: whom[0]['user'], move_type: this.moveType}, false, true);
    }
  }


  getTrashCount() {
    this.cardService.getTrashCount({room: this.room}).subscribe((res) => {
      if (res['cards_count'] && res['cards_count'] > 0)
        this.trashCount = res['cards_count'];
    }, (err) => {
      console.log('getTrashCount: ', err);
    });
  }

  pushCards() {
    let count = this.myCards.length;
    this.cardService.pushCards({room: this.room, count: count}).subscribe((res) => {
      if (res['success']) {
        this.getUserCards();
      }
    });
  }

}
