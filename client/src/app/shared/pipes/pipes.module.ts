import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {GetUserName} from "./get-user-name.pipe";


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    GetUserName
  ],
  providers: [
    GetUserName
  ],
  exports: [
    GetUserName
  ]
})
export class PipesModule { }
