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
  roomName: string = '';

  constructor(private chatService: ChatService, private tableService: TableService) {}

  ngOnInit() {
    var user = localStorage.getItem("user_name");
    // console.log(user);
    if(user!==null) {
      if (this.chat !== 'General') {
        this.tableService.getTableInfo(this.chat).subscribe((res) => {
          if (res) {
            let result = res["table_info"];
            this.roomName = result.name;
            this.getChatByRoom(this.roomName);
            this.msgData = { room: this.roomName, nickname: user, message: '' }
          }
        },
        (err) => {
          console.log(err);
        });
      } else {
        this.roomName = this.chat;
        this.getChatByRoom(this.roomName);
        this.msgData = { room: this.roomName, nickname: user, message: '' }
      }
      this.joinned = true;
      this.scrollToBottom();
    }
    this.socket.on('new-message', function (data) {
      if(data.message.room === this.roomName) {
        this.chats.push(data.message);
        // this.msgData = { room: user.room, nickname: user.nickname, message: '' }
        this.scrollToBottom();
      }
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

  getChatByRoom(room) {
    this.chatService.getChatByRoom(room).subscribe((res) => {
      this.chats = res;
    }, (err) => {
      console.log(err);
    });
  }

  joinRoom() {
    var date = new Date();
    localStorage.setItem("user", JSON.stringify(this.newUser));
    this.getChatByRoom(this.roomName);
    this.msgData = { room: this.roomName, nickname: this.newUser.nickname, message: '' };
    this.joinned = true;
    this.socket.emit('save-message', { room: this.roomName, nickname: this.user, message: 'Join this room', updated_at: date });
  }

  sendMessage() {
    this.chatService.saveChat(this.msgData).subscribe((result) => {
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

}
