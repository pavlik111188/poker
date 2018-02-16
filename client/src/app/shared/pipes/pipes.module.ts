import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GetUserName } from './get-user-name.pipe';
import { GetCardRank } from './get-card-rank.pipe';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    GetUserName,
    GetCardRank
  ],
  providers: [
    GetUserName,
    GetCardRank
  ],
  exports: [
    GetUserName,
    GetCardRank
  ]
})
export class PipesModule { }
