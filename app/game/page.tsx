"use client";

import { GameState, initialiseGameState, PlayerState, updateBoard } from "@/utils/engine";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, Crown, RotateCcw, Skull } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";



export default function Game() {
    const [gameState, setGameState] = useState<GameState>();

    useEffect(() => {
        if (gameState === undefined) {
            setGameState(initialiseGameState());
        }
    }, []);

    return <div className="h-screen w-screen flex portrait:flex-col max-w-7xl mx-auto">
        <div className="landscape:w-2/3 portrait:h-2/3 max-h-screen max-w-screen object-center">
            <div className="aspect-square grid grid-cols-4 gap-1 p-4 m-auto max-h-full max-w-full">
                {gameState && gameState.board.map((val, i) => {
                    return <div
                        key={i} className={`aspect-square flex relative -z-30
                         ${val.type === "collapsed" && "bg-gray-900"}`
                        }>
                        <AnimatePresence>
                            {(val.type === "default" || val.type === "path") && <motion.div
                                className="absolute h-full w-full bg-gray-500 -z-20"
                                // initial={{ opacity: 0, scale: 0 }}
                                // animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{
                                    duration: 0.4,
                                    scale: { type: "spring", visualDuration: 2, bounce: 0.5 },
                                }}
                            >
                                <div className="font-black text-2xl p-1">
                                    {(val.type === "default" || val.type === "path") && val.number}
                                </div>
                            </motion.div>}
                        </AnimatePresence>
                        <AnimatePresence initial={false}>
                            {val.type === "path" && gameState.player1.displayedPosition !== i && gameState.player2.displayedPosition !== i &&
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
                            {gameState.player1.displayedPosition === i && <PlayerPiece playerState={gameState.player1} className="bg-red-700 -z-10" />}
                            {gameState.player2.displayedPosition === i && <PlayerPiece playerState={gameState.player2} className="bg-blue-700 -z-10" />}
                        </AnimatePresence>
                    </div>;
                })}
            </div>
        </div>
        <div className="landscape:w-1/3 portrait:h-1/3 max-h-screen max-w-screen">
            <div className="landscape:h-full portrait:w-full flex">
                {gameState &&
                    <div className="grid grid-cols-3 gap-2 m-auto h-60 w-60">
                        {/* ROW 1 */}
                        <div></div>
                        <button className="bg-gray-700" onClick={() => {
                            setGameState(updateBoard(gameState, "up"));
                        }}>
                            <ArrowUp className="h-full w-full" />
                        </button>
                        <div></div>

                        {/* ROW 2 */}
                        <div className=" bg-gray-700" onClick={() => {
                            setGameState(updateBoard(gameState, "left"));

                        }}>
                            <ArrowLeft className="h-full w-full" />
                        </div>
                        <div className=" bg-gray-700" onClick={() => {
                            setGameState(updateBoard(gameState, "down"));

                        }}>
                            <ArrowDown className="h-full w-full" />
                        </div>
                        <div className=" bg-gray-700" onClick={() => {
                            setGameState(updateBoard(gameState, "right"));

                        }}>
                            <ArrowRight className="h-full w-full" />
                        </div>

                        {/* ROW 3 */}
                        <div className="bg-red-700" onClick={() => {
                            setGameState(updateBoard(gameState, "reset"));

                        }}>
                            <RotateCcw className="h-full w-full" />
                        </div>
                        <div></div>
                        <div className="bg-green-700" onClick={() => {
                            setGameState(updateBoard(gameState, "confirm"));

                        }}>
                            <Check className="h-full w-full" />
                        </div>


                    </div>}
            </div>
        </div>
    </div>;

}

interface PlayerPieceProps {
    playerState: PlayerState, className: string;
}
function PlayerPiece(props: PlayerPieceProps) {
    const { playerState: player, className } = props;

    return <motion.div
        className={`w-2/3 aspect-square m-auto flex`}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}

        transition={{
            duration: 0.4,
            scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
        }}

    // key={"player" + className}
    // layout
    // transition={
    //     {
    //         type: "spring",
    //         damping: 20,
    //         stiffness: 300,
    //     }

    // }
    >
        <div className={`m-auto p-1 sm:p-2 xl:p-4 rounded-full ${className} w-3/4 h-3/4`}>
            {player.state === "winner" &&
                <Crown className="h-full w-full" />
            }
            {player.state === "loser" &&
                <Skull className="h-full w-full" />
            }
            {
                (player.state === "default" || player.state === "start") &&
                <div className="h-full w-full flex">
                    <span className="font-black text-2xl m-auto">{player.steps}</span>
                </div>
            }
        </div>
    </motion.div>;
}