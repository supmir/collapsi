

interface CardState {
    number: -2 | -1 | 1 | 2 | 3 | 4;
    type: "default" | "collapsed" | "path";
}

type Player = 1 | 2;


type PlayerAction = "up" | "down" | "left" | "right" | "confirm" | "reset";

interface PlayerState {
    state: "start" | "default" | "winner" | "loser";
    currentPosition: number;
    displayedPosition: number;
    steps: number;
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

}
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

export function initialiseGameState(): GameState {
    const tempBoard = shuffleTuple(sample);
    return {
        board: tempBoard,
        turn: 1,
        player1: {
            displayedPosition: tempBoard.findIndex(obj => obj.number === -1),
            currentPosition: tempBoard.findIndex(obj => obj.number === -1),
            steps: 4,
            state: "start",
            actions: []
        },
        player2: {
            displayedPosition: tempBoard.findIndex(obj => obj.number === -2),
            currentPosition: tempBoard.findIndex(obj => obj.number === -2),
            steps: 4,
            state: "start",
            actions: []
        },
        history: [],
    };
}

export function updateBoard(current: GameState, action: PlayerAction): GameState {
    const targetPlayer = current.turn === 1 ? "player1" : "player2";

    const currentPlayerState = current[targetPlayer];
    console.log(action);
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
                return {
                    ...current,
                    [targetPlayer]: {
                        ...currentPlayerState,
                        steps: currentPlayerState.steps - 1,
                        displayedPosition: newPosition,
                        actions: [...currentPlayerState.actions, action]
                    },
                };
            }
            throw new Error("Out of steps");

        case "confirm": {
            const newBoard = mapTuple(current.board, (val) => { return { ...val, type: val.type === "path" ? "default" : val.type }; });
            newBoard[currentPlayerState.displayedPosition].type = "collapsed";
            if (currentPlayerState.steps === 0 || (currentPlayerState.state === "start" && currentPlayerState.steps < 4))
                return {
                    ...current,
                    board: newBoard,
                    turn: current.turn === 1 ? 2 : 1,
                    [targetPlayer]: {
                        ...currentPlayerState,
                        state: "default", // this one is not necessary to do when steps=0 and not start but to shorted code I will
                        currentPosition: currentPlayerState.displayedPosition,
                        steps: current.board[currentPlayerState.displayedPosition].number
                    },
                    history: [...current.history, currentPlayerState.actions]
                };
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
