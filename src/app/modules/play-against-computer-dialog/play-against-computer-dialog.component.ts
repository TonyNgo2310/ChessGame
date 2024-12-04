import { Component } from '@angular/core';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { StockfishService } from '../computer-mode/stockfish.service';
import { Color } from '../../chess-logic/model';
import { Router } from '@angular/router';
import { stockfishLevels } from '../computer-mode/models';
@Component({
  selector: 'app-play-against-computer-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, CommonModule],
  templateUrl: './play-against-computer-dialog.component.html',
  styleUrl: './play-against-computer-dialog.component.css'
})
export class PlayAgainstComputerDialogComponent {
  public stockfishLevels: readonly number[] =[1,2,3,4,5];
  public stockfishLevel: number = 1;

  constructor(private stockfishService: StockfishService, 
    private dialog: MatDialog, 
    private router: Router
  ){ }
  public selectStockfishLevel(level: number):void {
    this.stockfishLevel = level;
  }
  public play(color: "w"|"b"): void{
    this.dialog.closeAll();
    this.stockfishService.computerConfiguration$.next ({
      color: color === "w" ? Color.Black: Color.White,
      level: stockfishLevels[this.stockfishLevel]
    });
    this.router.navigate(["against-computer"]);
  }

  public closeDialog(): void{
    this.router.navigate(["against-friend"]);
  }
}
