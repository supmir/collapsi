import { CardState, Player, PlayerAction, PlayerState } from "@/utils/engine";
import { AnimatePresence, motion } from "motion/react";
import PlayerPiece from "./PlayerPiece";

interface SquareProps {
    cardState: CardState;
    playerState?: PlayerState;
    turn: Player;
    isTurn: boolean;
    action?: PlayerAction;
    updateBoard: (action: PlayerAction) => void;
}

export default function Square(props: SquareProps) {
    const { cardState, playerState, turn, isTurn, action, updateBoard } = props;
    return <div
        className="aspect-square flex relative bg-gray-900">
        <AnimatePresence>
            {/* Floating platform */}
            {(cardState.type === "default" || cardState.type === "path" || playerState) && <motion.div
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
            {cardState.type === "path" && !isTurn && !playerState &&
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{
                        duration: 0.4,
                        scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
                    }}
                    className={`w-5/12 aspect-square m-auto rounded-full flex items-center justify-center z-20 ${turn === 1 ? "bg-red-200" : "bg-blue-200"}`}
                >
                </motion.div>}

            {action && !playerState &&
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
            {playerState && <PlayerPiece playerState={playerState} isTurn={turn === playerState.id} className={`${playerState.id === 1 ? "bg-red-700" : "bg-blue-700"} z-20`} />}
        </AnimatePresence>
    </div>;
}