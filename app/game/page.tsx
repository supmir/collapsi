"use client";
import { GameState, initialiseGameState, PlayerState, updateBoard } from "@/utils/engine";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, Crown, RotateCcw, Skull } from "lucide-react";
import { useEffect, useState } from "react";



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
                    return <div key={i} className={`aspect-square flex
                         ${val.type === "collapsed" && "bg-gray-900"}
                     ${val.type === "path" && "bg-gray-500"}
                     ${val.type === "default" && "bg-gray-500"}`
                    }>
                        <div className="p-2 absolute font-black text-2xl">
                            {(val.type === "default" || val.type === "path") && val.number}

                        </div>
                        {val.type === "path" && gameState.player1.displayedPosition !== i && gameState.player2.displayedPosition !== i &&
                            <div className="w-1/2 aspect-square bg-gray-700 m-auto rounded-full flex items-center justify-center">
                            </div>}
                        {gameState.player1.displayedPosition === i && <PlayerPiece playerState={gameState.player1} className="bg-red-700" />}
                        {gameState.player2.displayedPosition === i && <PlayerPiece playerState={gameState.player2} className="bg-blue-700" />}
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

    return <div className={`w-2/3 aspect-square m-auto flex relative`}>
        {(player.state === "winner" || player.state === "loser") && <span className="rounded-full bg-black h-1/3 w-1/3 absolute flex">
            <div className="m-auto leading-0 font-black text-xl">
                {player.steps}
            </div>
        </span>}
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
    </div>;
}