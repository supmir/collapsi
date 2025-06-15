import { GameState, Player, PlayerAction } from "@/utils/engine";
import { AnimatePresence, motion } from "motion/react";
import PlayerPiece from "./PlayerPiece";

interface SquareProps {
    gameState: GameState;
    cardNumber: number;
    playerNumber: Player;
    updateBoard: (action: PlayerAction) => void;
}

export default function Square(props: SquareProps) {
    const { gameState, cardNumber, playerNumber, updateBoard } = props;
    const cardState = gameState.board[cardNumber];
    const action = gameState.validMoves[cardNumber];

    const isPlayerTurn = playerNumber === gameState.turn;

    const playerState = gameState.player1.displayedPosition === cardNumber ? gameState.player1 :
        (gameState.player2.displayedPosition === cardNumber ? gameState.player2 : undefined);

    const hasDisplayedPlayer = !!playerState;

    const isShowPlatform = cardState.type === "default" || cardState.type === "path" || hasDisplayedPlayer;

    const isShowPath = cardState.type === "path" && !isPlayerTurn && !hasDisplayedPlayer;
    const isShowLegalMoves = action && isPlayerTurn;

    return <div
        className="aspect-square flex relative bg-gray-900">
        <AnimatePresence>
            {/* Floating platform */}
            {isShowPlatform && <motion.div
                className="absolute h-full w-full bg-gray-500 z-10"
                initial={{
                    opacity: 0, scale: 0
                }}
                animate={{
                    opacity: 1, scale: 1, transition: {
                        duration: 0.4,
                        scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },

                    }
                }}
                exit={{
                    opacity: 0, scale: 0, transition: {
                        duration: 0.7,
                        scale: { type: "spring", visualDuration: 0.7, bounce: 0.5 },
                    }
                }}
            >
                <div className="font-black text-2xl p-1">
                    {(cardState.type === "default" || cardState.type === "path") && cardState.number}
                </div>
            </motion.div>}
        </AnimatePresence>
        <AnimatePresence initial={false}>
            {isShowPath &&
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{
                        duration: 0.4,
                        scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
                    }}
                    className={`w-5/12 aspect-square m-auto rounded-full flex items-center justify-center z-20 ${gameState.turn === 1 ? "bg-red-200" : "bg-blue-200"}`}
                >
                </motion.div>}

            {isShowLegalMoves &&
                <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{
                        duration: 0.4,
                        scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
                    }}
                    className="w-1/2 aspect-square bg-gray-700 m-auto rounded-full flex items-center justify-center z-20"
                    onClick={() => {
                        updateBoard(action);
                    }}
                >
                </motion.button>}
            {hasDisplayedPlayer && <PlayerPiece playerState={playerState} isTurn={playerState.id === gameState.turn} className={`${playerState.id === 1 ? "bg-red-700" : "bg-blue-700"} z-20`} />}
        </AnimatePresence>
    </div>;
}