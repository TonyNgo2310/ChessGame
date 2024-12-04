import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChessBoard } from '../../chess-logic/Chessboard';
import { CheckState, Color, Coords, FENChar, GameHistory, LastMove, MoveList, MoveType, SafeSquares, pieceImagePaths } from '../../chess-logic/model';
import { SelectedSquare } from './models';
import { Subscription, filter, fromEvent, tap } from 'rxjs';
import { ChessBoardService } from './chess-board.service';
import { FENConverter } from '../../chess-logic/FENConverted';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-chess-board',
  templateUrl: './chess-board.component.html',
  styleUrls: ['./chess-board.component.css']
})
export class ChessBoardComponent implements OnInit, OnDestroy{
  public pieceImagePaths = pieceImagePaths;


  protected chessBoard = new ChessBoard();
  public chessBoardView: (FENChar|null)[][] = this.chessBoard.chessBoardView;
  public get playerColor(): Color{return this.chessBoard.playerColor;};
  public get safeSquares(): SafeSquares{ return this.chessBoard.safeSquares;};
  public get gameOverMessafe(): string|undefined{return this.chessBoard.gameOverMessage;};


  private selectedSquare: SelectedSquare = {piece: null};
  private pieceSafeSquares: Coords[] = [];
  private lastMove: LastMove|undefined = this.chessBoard.lastMove;
  private checkState: CheckState = this.chessBoard.checkState;

  public get moveList(): MoveList{
    return this.chessBoard.moveList;
  };
  public get gameHistory(): GameHistory{ 
    return this.chessBoard.gameHistory;
  }
  public gameHistoryPointer: number = 0


  constructor(protected chessBoardService: ChessBoardService) { }

  public ngOnInit(): void {
    const keyEventSubscription$: Subscription = fromEvent<KeyboardEvent>(document, "keyup")
      .pipe(
        filter(event => event.key === "ArrowRight" || event.key === "ArrowLeft"),
        tap(event => {
          switch (event.key) {
            case "ArrowRight":
              if (this.gameHistoryPointer === this.gameHistory.length - 1) return;
              this.gameHistoryPointer++;
              break;
            case "ArrowLeft":
              if (this.gameHistoryPointer === 0) return;
              this.gameHistoryPointer--;
              break;
            default:
              break;
          }

          this.showPreviousPosition(this.gameHistoryPointer);
        })
      )
      .subscribe();

    this.subscriptions$.add(keyEventSubscription$);
  }

  public ngOnDestroy(): void {
    this.subscriptions$.unsubscribe();
    this.chessBoardService.chessBoardState$.next(FENConverter.initalPosition);
  }
  private subscriptions$ = new Subscription();

  public flipmode: boolean = false;
  public flipboard(): void{
    this.flipmode = !this.flipmode;
  }

  public isSquareDark(x: number, y: number): boolean{
    return ChessBoard.isSquareDark(x,y);
  }

  public isSquareSelected(x: number, y: number): boolean {
    if (!this.selectedSquare.piece) return false;
    return this.selectedSquare.x === x && this.selectedSquare.y === y;
  }
  // promotion properties
  public isPromotionActive: boolean = false; 
  private promotionCoords: Coords|null = null;
  private promotedPiece: FENChar|null = null;
  public promotionPieces(): FENChar[]{
    return this.playerColor === Color.White?
      [FENChar.WhiteKnight, FENChar.WhiteBishop,FENChar.WhiteRook,FENChar.WhiteQueen] :
      [FENChar.BlackKnight, FENChar.BlackBishop,FENChar.BlackRook,FENChar.BlackQueen] ;
  }
  public isSquareSafeForSelectedPiece(x: number, y: number): boolean {
    return this.pieceSafeSquares.some(coords => coords.x === x && coords.y === y);
  }


  public isSquareLastMove(x: number, y: number): boolean {
    if(!this.lastMove) return false;
    const{prevX, prevY, currX, currY} = this.lastMove;
    return x=== prevX && y=== prevY || x=== currX && y=== currY;
  }
  
  public isSquareChecked(x: number, y: number): boolean{
    return this.checkState.isInCheck && this.checkState.x === x && this.checkState.y === y;
  }

  public isSquarepromotionSquare(x:number, y:number): boolean{
    if(!this.promotionCoords) return false;
    return this.promotionCoords.x === x && this.promotionCoords.y === y;
  }

  private unmarkingPreviouslySelectedAndSafeSquares(): void{
    this.selectedSquare = {piece:null};
    this.pieceSafeSquares = [];

    if(this.isPromotionActive){
      this.isPromotionActive = false;
      this.promotedPiece = null;
      this.promotionCoords = null;
    }
  }
  private selectingPiece(x: number, y: number): void {
    if(this.gameOverMessafe !== undefined) return;
    const piece: FENChar | null = this.chessBoardView[x][y];
    if (!piece) return;
    if (this.isWrongPieceSelected(piece)) return;

    const isSameSquareClicked: boolean = !!this.selectedSquare.piece && this.selectedSquare.x === x && this.selectedSquare.y === y;
    this.unmarkingPreviouslySelectedAndSafeSquares();
    if(isSameSquareClicked) return;
    this.selectedSquare = { piece, x, y };
    this.pieceSafeSquares = this.safeSquares.get(x + "," + y) || [];
  }


  private placingPiece(newX: number, newY: number): void{
    if (!this.selectedSquare.piece) return;
    if (!this.isSquareSafeForSelectedPiece(newX, newY)) return;

    //pawn promotion
    const isPawnSelected: boolean = this.selectedSquare.piece === FENChar.WhitePawn || this.selectedSquare.piece === FENChar.BlackPawn;
    const isPawnOnLastRank: boolean = isPawnSelected && (newX === 7 || newX === 0);
    const ShouldOpenPromotionDialogue: boolean = !this.isPromotionActive && isPawnOnLastRank;

    if(ShouldOpenPromotionDialogue){
      this.pieceSafeSquares = [];
      this.isPromotionActive = true;
      this.promotionCoords = {x:newX, y:newY};
      //because new we wait for player to choose promoted piece
      return;
    }

    const { x: prevX, y: prevY } = this.selectedSquare;
    this.updateBoard(prevX,prevY,newX,newY, this.promotedPiece);
  }

  protected updateBoard(prevX:number, prevY: number, newX:number, newY:number, _promotedPiece: FENChar|null):void{
    this.chessBoard.move(prevX, prevY, newX, newY, this.promotedPiece);
    this.chessBoardView = this.chessBoard.chessBoardView;
    this.markLastMoveAndCheckState(this.chessBoard.lastMove, this.chessBoard.checkState);
    this.unmarkingPreviouslySelectedAndSafeSquares()
    this.chessBoardService.chessBoardState$.next(this.chessBoard.boardAsFEN);
    this.gameHistoryPointer++;
  }

  public closePawnPromotionDialog():void{
    this.unmarkingPreviouslySelectedAndSafeSquares();
  }

  private markLastMoveAndCheckState(lastMove: LastMove|undefined, checkState:CheckState): void{
    this.lastMove = lastMove;
    this.checkState = checkState;

    if (this.lastMove)
      this.moveSound(this.lastMove.moveType);
    else
      this.moveSound(new Set<MoveType>([MoveType.BasicMove]));
  }
  public move(x:number, y:number): void{
    this.selectingPiece(x,y);
    this.placingPiece(x,y);
  }

  public promotePieces(piece:FENChar): void{
    if(!this.promotionCoords || !this.selectedSquare.piece) return;
    this.promotedPiece = piece;
    const{x:newX,y:newY} = this.promotionCoords;
    const {x:prevX, y:prevY} = this.selectedSquare;
    this.updateBoard(prevX,prevY,newX,newY, this.promotedPiece);
  }
    
  private isWrongPieceSelected(piece: FENChar): boolean {
    const isWhitePieceSelected: boolean = piece === piece.toUpperCase();
    return isWhitePieceSelected && this.playerColor === Color.Black ||
      !isWhitePieceSelected && this.playerColor === Color.White;
  }

  isVisible: boolean = false;
  isFirstButtonClicked: boolean = false;
  clickCount: number = 0;
  
  firstButtonClick(): void {
      this.clickCount++;
      if (this.clickCount === 1) {
          this.isVisible = true;
      }
  }
  public showPreviousPosition(moveIndex: number): void {
    const { board, checkState, lastMove } = this.gameHistory[moveIndex];
    this.chessBoardView = board;
    this.markLastMoveAndCheckState(lastMove, checkState);
    this.gameHistoryPointer = moveIndex;
  }

  private moveSound(moveType: Set<MoveType>): void {
    const moveSound = new Audio("assets/sound/move.mp3");

    if (moveType.has(MoveType.Promotion)) moveSound.src = "assets/sound/promote.mp3";
    else if (moveType.has(MoveType.Capture)) moveSound.src = "assets/sound/capture.mp3";
    else if (moveType.has(MoveType.Castling)) moveSound.src = "assets/sound/castling.mp3";

    if (moveType.has(MoveType.CheckMate)) moveSound.src = "assets/sound/checkmate.mp3";
    else if (moveType.has(MoveType.Check)) moveSound.src = "assets/sound/check.mp3";

    moveSound.play();
  }

  public drop(event: CdkDragDrop<any>,x:number, y:number): void {
    const pieceData = event.item.data;
    const toX = event.container.element.nativeElement.getAttribute('data-x');
    const toY = event.container.element.nativeElement.getAttribute('data-y');

    if (toX !== null && toY !== null) {
      const newX = parseInt(toX, 10);
      const newY = parseInt(toY, 10);

      if (!pieceData.piece) return;
      if (!this.isSquareSafeForSelectedPiece(newX, newY)) return;

      // Remove piece from the previous position
      this.chessBoardView[pieceData.x][pieceData.y] = null;

      // Move piece to the new position
      this.chessBoardView[x][y] = pieceData.piece;
    
      this.selectingPiece(x,y);
      this.placingPiece(x,y);
    }
    // Additional logic for handling the move, updating game state, etc.
  
}

  
}
  

