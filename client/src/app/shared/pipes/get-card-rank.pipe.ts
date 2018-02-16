import { Pipe, PipeTransform } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { CardService } from '../../services/card.service';

@Pipe({
  name: 'getCardRank'
})
export class GetCardRank implements PipeTransform {


  constructor(private cardService: CardService) {

  }

  /*getUserName(email: string) {
    this.authenticationService.getUserName(email).subscribe((res) => {
      console.log(res);
      return res;
    });
  }*/

  transform(card: string): any {
    // this.cardService.getCardRank(card).subscribe((res) => {
      return card;
    // });
  }

  /*transform(email): any {
    return this.getUserName(email);
  }*/

}
