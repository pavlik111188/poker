import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { TableService } from '../../services/table.service';
import * as io from "socket.io-client";
import {Router} from "@angular/router";
import {ngContentDef} from "@angular/core/src/view";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewChecked {

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  @Input('chat') chat;

  @Output() users_count: EventEmitter<any> = new EventEmitter();

  joinned: boolean = false;
  msgData = { room: '', user: '', message: '' };
  socket = io('http://localhost:4000');
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
    this.roomTitle = this.chat['name'];
    // if (this.chat['name'] == 'General') {
      this.socket.emit('room', this.chat);
    // }

    this.socket.on('join', (data) => {
      if (data.status == 'success') {
        console.log('join ', data);
        this.joinned = true;
      }
    });

  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

}
