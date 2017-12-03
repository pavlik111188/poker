/**
 * Created by Pavel S on 01.06.17.
 */

import { Injectable } from '@angular/core';

@Injectable()
export class ValidateService {

    constructor() { }

    validateEmailPassw(user) {
        if (user.email == undefined || user.password == undefined) {
            return false;
        } else {
            return true;
        }
    }

    validateRegister(user) {
        if (user.name == undefined || user.firstname == undefined || user.lastname == undefined || user.email == undefined || user.password == undefined) {
            return false;
        } else {
            return true;
        }
    }

    validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
}
