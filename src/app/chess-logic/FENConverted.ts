import { columns } from "../modules/chess-board/models";
import { Color, LastMove } from "./model";
import { King } from "./pieces/King";
import { Pawn } from "./pieces/Pawns";
import { Rook } from "./pieces/Rook";
import { Piece } from "./pieces/piece";

export class FENConverter{
    public static readonly initalPosition: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    public convertBoardToFEN(
        board: (Piece|null)[][],
        playerColor: Color,
        lastMove: LastMove|undefined,
        fiftyMoveRuleCounter: number,
        numberOffFullMoves: number,
    ) : string{
        let FEN: string="";
        for(let i = 7; i>=0; i--){
            let FENRow: string="";
            let consecutiveEmptySquaresCounter = 0;

            for(const piece of board[i]){
                if(!piece){
                    consecutiveEmptySquaresCounter++;
                    continue;
                }

                if(consecutiveEmptySquaresCounter !== 0)
                    FENRow += String(consecutiveEmptySquaresCounter);

                consecutiveEmptySquaresCounter = 0;
                FENRow += piece.FENChar;
            }

            if(consecutiveEmptySquaresCounter !== 0)
                FENRow += String(consecutiveEmptySquaresCounter);

            FEN += (i === 0)? FENRow: FENRow + "/";
        }
        const player: string = playerColor === Color.White? "w": "b";
        FEN +=" "+ player;
        FEN += " " + this.castlingAvaiilability(board);
        FEN +=" " + this.enPassantPossibility(lastMove, playerColor);
        FEN +=" " + fiftyMoveRuleCounter * 2;
        FEN +=" " + numberOffFullMoves;
        
        
        return FEN
    }

    private castlingAvaiilability(board: (Piece|null)[][]): string{
        const castlingPossibilities = (color:Color): string => {
            let castlingAvaiilability: string="";

            const KingPositionX: number = color === Color.White ? 0:7;
            const king: Piece|null = board[KingPositionX][4];

            if(king instanceof King && !king.hasMoved){
                const rookPositionX: number = KingPositionX;
                const kingSideRook = board[rookPositionX][7];
                const queenSideRook = board[rookPositionX][0];

                if(kingSideRook instanceof Rook && !kingSideRook.hasMoved)
                    castlingAvaiilability+="k";

                if(queenSideRook instanceof Rook && !queenSideRook.hasMoved)
                    castlingAvaiilability+="q";

                if(color === Color.White)
                    castlingAvaiilability = castlingAvaiilability.toUpperCase();
            }
            return castlingAvaiilability;
        }
        const castlingAvaiilability: string = castlingPossibilities(Color.White) + castlingPossibilities(Color.Black);
        return castlingAvaiilability !== "" ? castlingAvaiilability: "-";
    }

    private enPassantPossibility(lastMove: LastMove|undefined, color: Color): string{
        if(!lastMove) return "-";
        const {piece, currX: newX, prevX, prevY} = lastMove;

        if(piece instanceof Pawn && Math.abs(newX-prevX) === 2){
            const row: number = color === Color.White ? 6:3;
            return columns[prevY] + String(row);

        }
        return "-";
    }
}