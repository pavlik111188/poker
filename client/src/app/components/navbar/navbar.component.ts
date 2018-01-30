import {Component, OnInit} from '@angular/core';

// Services
import { AuthenticationService } from '../../services/authentication.service';
import {Router} from "@angular/router";


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  isLogged: boolean = false;
  currentUser: string = '';

  constructor(
      private authenticationService: AuthenticationService,
      private router: Router
  ) {
    router.events.subscribe((val) => {
      if(JSON.parse(localStorage.getItem('currentUser'))) {
        this.isLogged = true;
        if(localStorage.getItem('user_name')) {
          this.currentUser = localStorage.getItem('user_name');
        } else {
          this.authenticationService.getUserInfo().subscribe(res => {
            this.currentUser = res;
          });
        }

      } else {
        this.isLogged = false;
      }
      //console.log('val ', JSON.parse(localStorage.getItem('currentUser')));
    });
    // this.currentUser = 'Paolo';
  }

  ngOnInit() {
  }

  logout() {
    this.authenticationService.logout();
  }

}
