import { FENChar, Coords, Color } from "../model";
import { Piece } from "./piece";

export class Rook extends Piece {
    private _hasMoved: boolean = false;
    protected override _FenChar: FENChar;
    protected override _directions: Coords[] = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 }
    ];

    constructor(private pieceColor: Color) {
        super(pieceColor);
        this._FenChar = pieceColor === Color.White ? FENChar.WhiteRook : FENChar.BlackRook;
    }

    public get hasMoved(): boolean {
        return this._hasMoved;
    }

    public set hasMoved(_) {
        this._hasMoved = true;
    }
}