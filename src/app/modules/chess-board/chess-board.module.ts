// chess-board.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChessBoardComponent } from './chess-board.component';
import { HttpClientModule } from "@angular/common/http";
import { ComputerModeComponent } from '../computer-mode/computer-mode.component';
import { NavMenuComponent } from '../nav-menu/nav-menu.component';
import { AppRoutingModule } from '../../app.routes';
import { AppComponent } from '../../app.component';
import { PlayAgainstComputerDialogComponent } from '../play-against-computer-dialog/play-against-computer-dialog.component';
import { MoveListComponent } from '../move-list/move-list.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [ChessBoardComponent, ComputerModeComponent],
  imports: [CommonModule, 
    HttpClientModule,
    AppRoutingModule,
    NavMenuComponent,
    PlayAgainstComputerDialogComponent,
    MoveListComponent,
    DragDropModule
  ],
  exports: [ NavMenuComponent],
  bootstrap: [AppComponent]
})
export class ChessBoardModule {}

