import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ChessBoardComponent } from '../chess-board/chess-board.component';
import { StockfishService } from './stockfish.service';
import { ChessBoardService } from '../chess-board/chess-board.service';
import { Subscription, firstValueFrom } from 'rxjs';
import { Color } from '../../chess-logic/model';

@Component({
  selector: 'app-computer-mode',
  templateUrl: '../chess-board/chess-board.component.html',
  styleUrl: '../chess-board/chess-board.component.css'
})
export class ComputerModeComponent extends ChessBoardComponent implements OnInit, OnDestroy{
    private computersubcription$ = new Subscription();
    constructor(private stockfishService: StockfishService){
        super(inject(ChessBoardService))
    }

    public override ngOnInit(): void {
        super.ngOnInit();
        const computerConfiSubscription$: Subscription = this.stockfishService.computerConfiguration$.subscribe({
            next:(computerConfiguration) => {
                if(computerConfiguration.color === Color.White) this.flipboard();
            }
        })
        const chessBoardStateSubcription$: Subscription = this.chessBoardService.chessBoardState$.subscribe({
            next: async(FEN: string) => {
                if(this.chessBoard.isGameOver) {
                    chessBoardStateSubcription$.unsubscribe();
                    return;
                }
                const player: Color = FEN.split(" ") [1] === "w" ? Color.White: Color.Black;
                if(player !== this.stockfishService.computerConfiguration$.value.color) return;

                const {prevX, prevY, newX, newY, promotedPiece} = await firstValueFrom(this.stockfishService.getBestMove(FEN));
                this.updateBoard(prevX, prevY, newX, newY, promotedPiece);
            }
        });
        this.computersubcription$.add(chessBoardStateSubcription$);
        this.computersubcription$.add(computerConfiSubscription$);
    }
    public override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.computersubcription$.unsubscribe();
    }
}
