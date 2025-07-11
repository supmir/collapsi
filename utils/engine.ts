

export interface CardState {
    number: -2 | -1 | 1 | 2 | 3 | 4;
    type: "default" | "collapsed" | "path";
}

export type Player = 1 | 2;


export type PlayerAction = "up" | "down" | "left" | "right" | "confirm" | "reset";

export interface PlayerState {
    id: Player,
    state: "start" | "default" | "winner" | "loser";
    currentPosition: number;
    displayedPosition: number;
    steps: number;
    fullSteps: number;
    actions: PlayerAction[];

}

type FixedLengthArray<T, N extends number, R extends T[] = []> =
    R['length'] extends N ? R : FixedLengthArray<T, N, [T, ...R]>;

type BoardState = FixedLengthArray<CardState, 16>;

export interface GameState {
    board: BoardState,
    turn: Player,
    player1: PlayerState,
    player2: PlayerState,
    history: PlayerAction[][];
    phase: "play" | "end";
    validMoves: ValidMoves;

}
type ValidMoves = { [key: number]: PlayerAction; };

function shuffleTuple<T extends unknown[]>(tuple: readonly [...T]): [...T] {
    return [...tuple]
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value) as [...T];
}

function mapTuple<T extends unknown[], R>(
    tuple: readonly [...T],
    mapper: (value: T[number], index: number) => R
): { [K in keyof T]: R } {
    return tuple.map(mapper) as { [K in keyof T]: R };
}


const sample: BoardState = [
    { number: -1, type: "collapsed" }, //player 1 start
    { number: -2, type: "collapsed" }, //player 2 start

    { number: 1, type: "default" },
    { number: 1, type: "default" },
    { number: 1, type: "default" },
    { number: 1, type: "default" },

    { number: 2, type: "default" },
    { number: 2, type: "default" },
    { number: 2, type: "default" },
    { number: 2, type: "default" },

    { number: 3, type: "default" },
    { number: 3, type: "default" },
    { number: 3, type: "default" },
    { number: 3, type: "default" },


    { number: 4, type: "default" },
    { number: 4, type: "default" },
];

export function initialiseGameState(turn: Player): GameState {
    const tempBoard = shuffleTuple(sample);
    const player1StartingPos = tempBoard.findIndex(obj => obj.number === -1);
    const player2StartingPos = tempBoard.findIndex(obj => obj.number === -2);

    return {
        board: tempBoard,
        turn: turn,
        player1: {
            id: 1,
            displayedPosition: player1StartingPos,
            currentPosition: player1StartingPos,
            steps: 4,
            fullSteps: 4,
            state: "start",
            actions: []
        },
        player2: {
            id: 2,
            displayedPosition: player2StartingPos,
            currentPosition: player2StartingPos,
            steps: 4,
            fullSteps: 4,
            state: "start",
            actions: []
        },
        history: [],
        phase: "play",
        validMoves: getLegalMoves(tempBoard, player1StartingPos)
    };
}

export function updateBoard(current: GameState, action: PlayerAction): GameState {
    const targetPlayer = current.turn === 1 ? "player1" : "player2";
    const opponenetPlayer = current.turn !== 1 ? "player1" : "player2";

    const currentPlayerState = current[targetPlayer];
    const opponenetPlayerState = current[opponenetPlayer];
    const ret = { ...current };

    switch (action) {
        case "up":
        case "down":
        case "left":
        case "right":
            if (currentPlayerState.steps > 0) {
                const newPosition = getNewPosition(currentPlayerState.displayedPosition, action);
                if (current.board[newPosition].type === "collapsed") {
                    throw new Error("Card collapsed");
                }
                if (current.board[newPosition].type === "path") {
                    throw new Error("Card passed");
                }
                current.board[newPosition].type = "path";
                const newSteps = currentPlayerState.steps - 1;
                ret[targetPlayer] = {
                    ...currentPlayerState,
                    steps: newSteps,
                    displayedPosition: newPosition,
                    actions: [...currentPlayerState.actions, action]
                };
                if (newSteps > 0)
                    ret["validMoves"] = getLegalMoves(current.board, newPosition);
                else
                    ret["validMoves"] = {};
                return ret;
            }
            throw new Error("Out of steps");

        case "confirm": {
            const newBoard = mapTuple(current.board, (val) => { return { ...val, type: val.type === "path" ? "default" : val.type }; });
            newBoard[currentPlayerState.displayedPosition].type = "collapsed";
            if (currentPlayerState.steps === 0 || (currentPlayerState.state === "start" && currentPlayerState.steps < 4)) {
                const isGameEnd = !isLegalMoveExist(newBoard, current[opponenetPlayer].currentPosition, current[opponenetPlayer].steps);
                return {
                    ...current,
                    board: newBoard,
                    turn: current.turn === 1 ? 2 : 1,
                    [targetPlayer]: {
                        ...currentPlayerState,
                        state: isGameEnd ? "winner" : "default",
                        currentPosition: currentPlayerState.displayedPosition,
                        steps: current.board[currentPlayerState.displayedPosition].number,
                        fullSteps: current.board[currentPlayerState.displayedPosition].number,
                        actions: [],
                    },
                    [opponenetPlayer]: {
                        ...opponenetPlayerState,
                        state: isGameEnd ? "loser" : opponenetPlayerState.state,
                    },
                    history: [...current.history, currentPlayerState.actions],
                    phase: isGameEnd ? "end" : "play",
                    validMoves: getLegalMoves(newBoard, opponenetPlayerState.currentPosition)
                };
            }
            throw new Error("Not enough steps");
        }
        case "reset": {
            const newBoard = mapTuple(current.board, (val) => { return { ...val, type: val.type === "path" ? "default" : val.type }; });
            return {
                ...current,
                board: newBoard,
                [targetPlayer]: {
                    ...currentPlayerState,
                    displayedPosition: currentPlayerState.currentPosition,
                    steps: currentPlayerState.state === "start" ? 4 : current.board[currentPlayerState.currentPosition].number,
                    actions: []
                },
                validMoves: getLegalMoves(newBoard, currentPlayerState.currentPosition)
            };
        }
    }
}


function getNewPosition(position: number, action: PlayerAction): number {
    if (action === "up") {
        return position - 4 < 0 ? position + 12 : position - 4;
    }
    if (action === "down") {
        return position + 4 > 15 ? position - 12 : position + 4;

    }
    if (action === "left") {
        return position % 4 === 0 ? position + 3 : position - 1;
    }
    if (action === "right") {
        return (position - 3) % 4 === 0 ? position - 3 : position + 1;
    }
    return -1;
}


function isMoveValid(board: BoardState, position: number, action: PlayerAction) {
    return board[getNewPosition(position, action)].type === "default";
}

function getLegalMoves(board: BoardState, position: number) {
    const directions: PlayerAction[] = ["up", "down", "left", "right"];

    const ret: ValidMoves = {};
    directions.forEach(action => {
        const pos = getNewPosition(position, action);
        if (board[pos].type === "default") {
            ret[pos] = action;
        }
    });
    return ret;
}

function isLegalMoveExist(board: BoardState, position: number, steps: number): boolean {
    // return true;
    return _isLegalMoveExist([...board], position, steps);
}

function _isLegalMoveExist(board: BoardState, position: number, steps: number): boolean {
    const directions: PlayerAction[] = ["up", "down", "left", "right"];

    return directions.some((val) => {
        const isOneMoveValid = isMoveValid(board, position, val);
        if (!isOneMoveValid)
            return false;
        if (steps === 1)
            return true;
        else {
            const originalType = board[position].type;
            board[position].type = "path";
            const result = _isLegalMoveExist(board, getNewPosition(position, val), steps - 1);
            board[position].type = originalType;
            return result;

        }
    });
}


