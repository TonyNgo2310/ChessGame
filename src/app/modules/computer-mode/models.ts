import { Color, FENChar } from "../../chess-logic/model";

export type StockfishQueryParams = {
    fen: string;
    depth: number;
}

export type chessMove = {
    prevX: number;
    prevY: number;
    newX: number;
    newY: number;
    promotedPiece: FENChar|null;
}

export type StockfishResponse = {
    success: boolean;
    evaulatuion: number | null;
    mate: number | null;
    bestmove: string;
    continuation: string;
}

export type ComputerConfiguration = {
    color: Color;
    level: number;
}

export const stockfishLevels: Readonly<Record<number, number>> ={
    1:1,
    2:4,
    3:8,
    4:10,
    5:12
}