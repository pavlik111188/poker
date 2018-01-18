import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { TableService } from '../../services/table.service';
import * as io from "socket.io-client";
import {Router} from "@angular/router";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewChecked {

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  @Input('chat') chat: string;

  @Output() users_count: EventEmitter<any> = new EventEmitter();

  chats: any;
  joinned: boolean = false;
  newUser = { user: '', room: '' };
  msgData = { room: '', user: '', message: '' };
  socket: any;
  user = localStorage.getItem("user_name");
  email = localStorage.getItem("user_email");
  roomName: string = '';
  roomTitle: string = '';
  messages: any;
  usersInChat: number;
  usersCount: any = [];

  constructor(
    private chatService: ChatService,
    private tableService: TableService,
    private router: Router) {
  }

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
        this.socket = io('http://localhost:4000');
        this.roomName = this.chat;
        this.roomTitle = "Чат";
        this.getChatByRoom(this.roomName, this.roomTitle);
      }
      this.joinned = true;
      this.scrollToBottom();
    }

    /*this.socket.on('new-message', function (data) {
      // console.log('data ', data.message.room);
      // if (data.message.room == this.roomName) {
        this.messages.push(data.message);
        this.scrollToBottom();
        this.msgData = { room: this.roomName, user: this.user, message: '' };
      // }
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
    }.bind(this));*/


    // New socket io
    // on connection to server, ask for user's name with an anonymous callback
    /*this.socket.on('connect', function(){
      // call the server-side function 'adduser' and send one parameter (value of prompt)
      console.log('connect');
      this.socket.emit('adduser', {user: this.user, email: this.email, room: 'General'});
    }.bind(this));*/
    // listener, whenever the server emits 'updatechat', this updates the chat body
    this.socket.on('get_users_count', function (data) {
      // console.log('get_users_count: ', data);
    }.bind(this));

    this.socket.on('updatechat', function (data) {
      this.messages.push(data);
      this.scrollToBottom();
      this.msgData = { room: this.roomName, user: this.user, message: '' };
    }.bind(this));

    // listener, whenever the server emits 'updaterooms', this updates the room the client is in
    this.socket.on('updaterooms', function(data) {
      // this.socket.emit('remove_from_chat', data);
      this.getUsersInChat(data.room);
    }.bind(this));

    this.socket.on('add_to_chat', function (data) {
      this.socket.emit('add_to_chat', data);
      this.usersCount.push(data.email);
      // console.log(this.usersCount);
    }.bind(this));

    this.socket.on('remove_from_chat', function (data) {
      this.socket.emit('remove_from_chat', data);
      if (this.usersCount.indexOf(data.email) > -1) {
        this.usersCount.splice(this.usersCount.indexOf(data.email), 1);
        // console.log(this.usersCount);
      }
      this.switchRoom({user: this.user, email: this.email, room: data.room});
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
      this.msgData = { room: this.roomName, user: this.user, message: '' };

      this.socket.emit('adduser', {user: this.user, email: this.email, room: room});
      this.switchRoom({user: this.user, email: this.email, room: room});

    }, (err) => {
      console.log(err);
    });
  }

  joinRoom() {
    let date = new Date();
    this.joinned = true;

    // this.socket.emit('save-message', { room: this.roomName, user: this.user, message: 'Join this room', updated_at: date });
  }

  sendMessage() {
    this.chatService.saveMessage(this.msgData).subscribe((result) => {
       // this.socket.emit('save-message', result);
        this.socket.emit('sendchat', this.msgData);
    }, (err) => {
      console.log(err);
    });
  }

  logout() {
    // var date = new Date();
    // var user = JSON.parse(localStorage.getItem("user_name"));
    // this.socket.emit('save-message', { room: "General", user: user, message: 'Left this room', updated_at: date });
    // localStorage.removeItem("user_name");
    // this.joinned = false;
  }

  getUsersInChat(room) {
    // console.log('room: ', room);
    this.chatService.getUsersInChat(room).subscribe((res) => {
      if (res) {
        this.usersInChat = res['users'].length;
        this.users_count.emit(this.usersInChat);
      }
    },
    (err) => {
      console.log(err);
    });
  }

  switchRoom(room){
    // console.log('switchRoom ', room);
    this.socket.emit('switchRoom', room);
  }

}
