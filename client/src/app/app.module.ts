import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

// Non angular modules
import { FlashMessagesModule } from 'angular2-flash-messages';

// App Component
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';

// Services
import { AuthGuard } from './services/auth.guard';
import { AuthenticationService } from './services/authentication.service';
import { UserService } from './services/user.service';
import { ValidateService } from './services/validate.service';
import { TableService } from './services/table.service';
import { ChatService } from './services/chat.service';
import { CardService } from './services/card.service';

// Components
import { NavbarComponent } from './components/navbar/navbar.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { TableComponent } from './components/table/table.component';
import { ChatComponent } from './components/chat/chat.component';

@NgModule({
  imports: [
    NgbModule.forRoot(),
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    FlashMessagesModule
  ],

  declarations: [
    AppComponent,
    NavbarComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    DashboardComponent,
    ProfileComponent,
    TableComponent,
    ChatComponent
  ],

  providers: [
    AuthGuard,
    AuthenticationService,
    UserService,
    ValidateService,
    TableService,
    ChatService,
    CardService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
