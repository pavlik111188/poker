import { Component } from '@angular/core';

import { ResizeProvider } from './providers/resize-provider';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';

  constructor(
    // ResizeProvider = init resize and rotation
    private resizer: ResizeProvider
  ) {

  }
}
