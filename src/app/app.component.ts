import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChessBoardModule } from './modules/chess-board/chess-board.module'; // Adjust the path as necessary

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChessBoardModule], // Import the module here
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'chess-game';
}
