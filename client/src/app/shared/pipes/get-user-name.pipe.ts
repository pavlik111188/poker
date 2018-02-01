import { Pipe, PipeTransform } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';

@Pipe({
  name: 'getUserName'
})
export class GetUserName implements PipeTransform {


  constructor(private authenticationService: AuthenticationService) {

  }

  /*getUserName(email: string) {
    this.authenticationService.getUserName(email).subscribe((res) => {
      console.log(res);
      return res;
    });
  }*/

  transform(email: string): any {
    this.authenticationService.getUserName(email).subscribe((res) => {
      console.log(res.toString());
      return res.toString();
    });
  }

  /*transform(email): any {
    return this.getUserName(email);
  }*/

}
