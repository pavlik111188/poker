import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild, Input } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { TableService } from '../../services/table.service';
import * as io from "socket.io-client";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewChecked {

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  @Input('chat') chat: string;
  chats: any;
  joinned: boolean = false;
  newUser = { nickname: '', room: '' };
  msgData = { room: '', nickname: '', message: '' };
  socket = io('http://localhost:4000');
  user = localStorage.getItem("user_name");
  email = localStorage.getItem("user_email");
  roomName: string = '';
  roomTitle: string = '';
  messages: any;
  usersInChat: number;

  constructor(private chatService: ChatService, private tableService: TableService) {}

  ngOnInit() {
    // console.log(user);

    if(this.user !== null) {
      if (this.chat !== 'General') {
        this.tableService.getTableInfo(this.chat).subscribe((res) => {
          if (res) {
            let result = res["table_info"];
            this.roomName = result._id;
            this.roomTitle = result.name;
            this.getChatByRoom(this.roomName, this.roomTitle);

          }
        },
        (err) => {
          console.log(err);
        });
      } else {
        this.roomName = this.chat;
        this.roomTitle = "Чат";
        this.getChatByRoom(this.roomName, this.roomTitle);

      }
      this.joinned = true;
      this.scrollToBottom();
    }

    this.socket.on('new-message', function (data) {
      // console.log('data ', data.message.room);
      if (data.message.room == this.roomName) {
        this.messages.push(data.message);
        this.scrollToBottom();
        this.msgData = { room: this.roomName, nickname: this.user, message: '' };
      }
    }.bind(this));

    // Whenever the server emits 'user joined', log it in the chat body
    this.socket.on('user joined', function (data) {
      this.getUsersInChat(data.username.room);
    }.bind(this));

    // Whenever the server emits 'user left', log it in the chat body
    this.socket.on('user left', function (data) {
      this.getUsersInChat(data.username.room);
    }.bind(this));

    // Whenever the server emits 'typing', show the typing message
    this.socket.on('typing', function (data) {
    }.bind(this));

    // Whenever the server emits 'stop typing', kill the typing message
    this.socket.on('stop typing', function (data) {
    }.bind(this));

    this.socket.on('disconnect', function () {
      this.socket.emit('disconnect ', this.user);
    }.bind(this));

    this.socket.on('reconnect', function () {
      console.log('you have been reconnected');
      if (this.user) {
        this.socket.emit('add user ', this.user);
      }
    }.bind(this));

    this.socket.on('reconnect_error', function () {
      console.log('attempt to reconnect has failed');
    }.bind(this));

  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  getChatByRoom(room, title) {

    let data = {room: room, title: title};

    this.chatService.getChatByRoom(data).subscribe((res) => {
      this.messages = res;
      /*let chat = [];
      if (this.chats.length < 1) {

        this.chatService.saveChat(data).subscribe((res) => {
          console.log(res);
        });
        console.log(res);
      }*/
      this.msgData = { room: this.roomName, nickname: this.user, message: '' };
      this.socket.emit('add user', {user: this.user, email: this.email, room: room});
      this.getUsersInChat(room);
    }, (err) => {
      console.log(err);
    });
  }

  joinRoom() {
    let date = new Date();
    this.getChatByRoom(this.roomName, this.roomName);
    this.joinned = true;

    // this.socket.emit('save-message', { room: this.roomName, nickname: this.user, message: 'Join this room', updated_at: date });
  }

  sendMessage() {
    this.chatService.saveMessage(this.msgData).subscribe((result) => {
       this.socket.emit('save-message', result);
    }, (err) => {
      console.log(err);
    });
  }

  logout() {
    // var date = new Date();
    // var user = JSON.parse(localStorage.getItem("user_name"));
    // this.socket.emit('save-message', { room: "General", nickname: user, message: 'Left this room', updated_at: date });
    // localStorage.removeItem("user_name");
    // this.joinned = false;
  }

  getUsersInChat(room) {
    console.log('room: ', room);
    this.chatService.getUsersInChat(room).subscribe((res) => {
      if (res) {
        this.usersInChat = res['users'].length;
        console.log('res: ', res);
      }
    },
    (err) => {
      console.log(err);
    });
  }

}
