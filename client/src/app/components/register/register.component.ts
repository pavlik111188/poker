import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { FlashMessagesService } from 'angular2-flash-messages';
import { UserService } from '../../services/user.service';
import { ValidateService } from '../../services/validate.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

    name: String;
    firstname: String;
    lastname: String;
    email: String;
    password: String;

    model: any = {};
    loading = false;

    constructor(
        private router: Router,
        private userService: UserService,
        private flashMessagesService: FlashMessagesService,
        private validateService: ValidateService,
    ) { }

    register() {
        this.loading = true;
        const user = {
          name: this.name,
          firstname: this.firstname,
          lastname: this.lastname,
          email: this.email,
          password: this.password
        }

    let vUser = true;
    let vEmail = true;

    // Required fields
    if (!this.validateService.validateRegister(user)) {
      this.flashMessagesService.show('Please fill in all fields', {cssClass: 'alert-danger', timeout: 3000});
      vUser = false;
    }

    // Validate email
    if (!this.validateService.validateEmail(user.email)) {
        this.flashMessagesService.show('Please use a valid email', {cssClass: 'alert-danger', timeout: 3000});
        vEmail = false;
    }

    if (vUser  && vEmail) {
        // Need User model for create
        this.userService.singup(user).subscribe(
            data => {
                console.log('Data:', data);
                if (data.success) {
                    this.flashMessagesService.show(data.msg, {cssClass: 'alert-success', timeout: 3000});
                    this.router.navigate(['/login']);
                } else {
                    this.flashMessagesService.show(data.msg, {cssClass: 'alert-danger', timeout: 3000});
                    this.loading = false;
                }
            },
            error => {
                this.flashMessagesService.show(error, {cssClass: 'alert-danger', timeout: 3000});
                this.loading = false;
            }
        );
    }
  }

}
