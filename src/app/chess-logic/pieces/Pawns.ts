import { FENChar, Coords, Color } from "../model";
import { Piece } from "./piece";

export class Pawn extends Piece {
    private _hasMoved: boolean = false;
    protected override _FenChar: FENChar;
    protected override _directions: Coords[] = [
        {x: 1, y: 1},
        {x: 1, y: -1},
        {x: 2, y: 0},
        {x: 1, y: 0},
    ];

    constructor(private pieceColor: Color) {
        super(pieceColor);
        if (pieceColor === Color.Black) this.setBlackPawnDirection();
        this._FenChar = pieceColor === Color.White ? FENChar.WhitePawn : FENChar.BlackPawn;
    }

    private setBlackPawnDirection():void{
        this._directions = this._directions.map(({ x, y }) => ({ x: -1 * x, y }));
    }

    public get hasMoved():boolean{
        return this._hasMoved;
    }

    public set hasMoved(_){
        this._hasMoved = true;
        this._directions = [
            {x: 1, y: 1},
            {x: 1, y: -1},
            {x: 1, y: 0},
        ]
        if (this.pieceColor === Color.Black) this.setBlackPawnDirection();
    }
}