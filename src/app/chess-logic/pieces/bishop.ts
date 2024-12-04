import { FENChar, Coords, Color } from "../model";
import { Piece } from "./piece";

export class Bishop extends Piece{
    protected override _FenChar: FENChar;
    protected override _directions: Coords[] = [
        {x: 1, y: 1},
        {x: 1, y: -1},
        {x: -1, y: 1},
        {x: -1, y: -1},
    ];

    constructor(private pieceColor: Color) {
        super(pieceColor);
        this._FenChar = pieceColor === Color.White ? FENChar.WhiteBishop : FENChar.BlackBishop;
    }
}