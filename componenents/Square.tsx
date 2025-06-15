import { CardState, Player, PlayerState } from "@/utils/engine";
import { AnimatePresence, motion } from "motion/react";
import PlayerPiece from "./PlayerPiece";

interface SquareProps {
    cardState: CardState;
    playerState?: PlayerState;
    turn: Player;
}

export default function Square(props: SquareProps) {
    const { cardState, playerState, turn } = props;
    return <div
        className={`aspect-square flex relative -z-30
     ${cardState.type === "collapsed" && "bg-gray-900"}`
        }>
        <AnimatePresence>
            {(cardState.type === "default" || cardState.type === "path" || playerState) && <motion.div
                className="absolute h-full w-full bg-gray-500 -z-20"
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
            {cardState.type === "path" && !playerState &&
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{
                        duration: 0.4,
                        scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
                    }}
                    className="w-1/2 aspect-square bg-gray-700 m-auto rounded-full flex items-center justify-center"
                >
                </motion.div>}
            {playerState && <PlayerPiece playerState={playerState} isTurn={turn === playerState.id} className={`${playerState.id === 1 ? "bg-red-700" : "bg-blue-700"} -z-10`} />}
        </AnimatePresence>
    </div>;
}