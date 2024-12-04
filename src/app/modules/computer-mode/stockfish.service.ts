import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, switchMap, BehaviorSubject } from 'rxjs';
import { StockfishQueryParams, StockfishResponse, chessMove, ComputerConfiguration } from './models';
import { Color, FENChar } from '../../chess-logic/model';

@Injectable({
  providedIn: 'root'
})
export class StockfishService {
    private readonly api: string="https://stockfish.online/api/s/v2.php";
    constructor(private http: HttpClient) { }

    public computerConfiguration$ = new BehaviorSubject<ComputerConfiguration>({color: Color.Black, level:1});
    private convertColumnLetterToYCoord(string: string): number{
        return string.charCodeAt(0) - "a".charCodeAt(0);
    }

    private promotedPiece(piece: string|undefined): FENChar|null{
        if(!piece) return null;
        const computerColor:Color = this.computerConfiguration$.value.color
        if(piece === "n") return computerColor === Color.White ? FENChar.WhiteKnight: FENChar.BlackKnight;
        if(piece === "b") return computerColor === Color.White ? FENChar.WhiteBishop: FENChar.BlackBishop;
        if(piece === "r") return computerColor === Color.White ? FENChar.WhiteRook: FENChar.BlackRook;
        return computerColor === Color.White ? FENChar.WhiteQueen: FENChar.BlackQueen;
    }

    private moveFromStockfishString(move:string): chessMove{
        const prevY: number = this.convertColumnLetterToYCoord(move[0]);
        const prevX: number = Number(move[1]) -1;
        const newY: number = this.convertColumnLetterToYCoord(move[2]);
        const newX: number = Number(move[3]) -1;
        const promotedPiece = this.promotedPiece(move[4]);
        return{ prevX, prevY, newX, newY, promotedPiece};
    }
    public getBestMove(fen:string): Observable<chessMove> {
        const queryParams: StockfishQueryParams ={
        fen,
        depth: this.computerConfiguration$.value.level,
        };

        let params= new HttpParams().appendAll(queryParams);

        return this.http.get<StockfishResponse>(this.api, {params})
            .pipe(
                switchMap(response => {
                    const bestMove: string = response.bestmove.split(" ")[1];
                    return of(this.moveFromStockfishString(bestMove));
                })
            )
    }
}
