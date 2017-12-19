import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';


//Services
import { AuthenticationService } from '../../services/authentication.service';
import { UserService } from '../../services/user.service';
import { ValidateService } from '../../services/validate.service';

// Models
import { User } from '../../models/user.model';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    name: string;
    email: string;
    password: string;

    loading = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private flashMessagesService: FlashMessagesService,
        private userService: UserService,
        private validateService: ValidateService,
    ) { }

    ngOnInit() {
        // clear token remove user from local storage to log user out
        this.authenticationService.logout();
    }


    login() {
        this.loading = true;
        const user = {
            email: this.email,
            password: this.password
        }

        let vPassword = true;
        let vEmail = true;

        // Required fields
        if (!this.validateService.validateEmailPassw(user)) {
            this.flashMessagesService.show('Please fill in all fields', {cssClass: 'alert-danger', timeout: 3000});
            vPassword = false;
        }

        // Validate email
        if (!this.validateService.validateEmail(user.email)) {
            this.flashMessagesService.show('Please use a valid email', {cssClass: 'alert-danger', timeout: 3000});
            vEmail = false;
        }

        if (vPassword  && vEmail) {
            this.userService.login(user)
                .subscribe(
                    data => {
                        if (data) {
                            // save token to local storage
                            this.authenticationService.token = data['token'];
                            localStorage.setItem('currentUser', JSON.stringify({ token: data['token'] }));
                            this.router.navigate(['/']);
                        }               
                    },
                    error => {
                        console.log(error);
                        this.flashMessagesService.show(error, {cssClass: 'alert-danger', timeout: 3000});
                        this.loading = false;
                    });
        }
    }

}
