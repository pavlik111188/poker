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

  constructor(
      private authenticationService: AuthenticationService,
      private router: Router
  ) {
    router.events.subscribe((val) => {
      if(JSON.parse(localStorage.getItem('currentUser'))) {
        this.isLogged = true;
      } else {
        this.isLogged = false;
      }
      //console.log('val ', JSON.parse(localStorage.getItem('currentUser')));
    });
  }

  ngOnInit() {

  }

  logout() {
    this.authenticationService.logout();
  }

}
