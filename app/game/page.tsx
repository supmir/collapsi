"use client";
import { GameState, initialiseGameState, updateBoard } from "@/utils/engine";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";



export default function Game() {
    const [gameState, setGameState] = useState<GameState>();

    useEffect(() => {
        if (gameState === undefined) {
            setGameState(initialiseGameState());
        }
    }, []);

    return <div className="h-screen w-screen flex portrait:flex-col">
        <div className="landscape:w-2/3 portrait:h-2/3 max-h-screen max-w-screen object-center">
            <div className="aspect-square grid grid-cols-4 gap-1 p-4 m-auto max-h-full max-w-full">
                {gameState && gameState.board.map((val, i) => {
                    return <div key={i} className={` bg-gray-500 aspect-square flex`}>
                        <div className="absolute">
                            {(val.type === "default" || val.type === "path") && val.number}

                        </div>
                        {gameState.player1.displayedPosition === i && <div className="w-1/2 aspect-square bg-red-700 m-auto rounded-full flex items-center justify-center">
                            {gameState.player1.steps}
                        </div>}
                        {gameState.player2.displayedPosition === i && <div className="w-1/2 aspect-square bg-blue-700 m-auto rounded-full flex items-center justify-center">
                            {gameState.player2.steps}
                        </div>}
                    </div>;
                })}
            </div>
        </div>
        <div className="landscape:w-1/3 portrait:h-1/3 max-h-screen max-w-screen">
            <div className="landscape:h-full portrait:w-full flex">
                {gameState &&
                    <div className="grid grid-cols-3 gap-2 m-auto h-60 w-60">
                        <div>
                            {/* Red&apos;s turn<br />
                        Moves:<br />
                        1 */}
                        </div>
                        <div className=" bg-gray-700" onClick={() => {
                            setGameState(updateBoard(gameState, "up"));
                        }}><ArrowUp className="h-full w-full" /></div>
                        <div></div>
                        <div className=" bg-gray-700" onClick={() => {
                            setGameState(updateBoard(gameState, "left"));

                        }}><ArrowLeft className="h-full w-full" /></div>

                        <div className=" bg-gray-700" onClick={() => {
                            setGameState(updateBoard(gameState, "down"));

                        }}
                        ><ArrowDown className="h-full w-full" /></div>

                        <div className=" bg-gray-700" onClick={() => {
                            setGameState(updateBoard(gameState, "right"));

                        }}><ArrowRight className="h-full w-full" /></div>

                        <div className="bg-red-700" onClick={() => {
                            setGameState(updateBoard(gameState, "reset"));

                        }}><RotateCcw className="h-full w-full" /></div>
                        <div></div>
                        <div className="bg-green-700" onClick={() => {
                            setGameState(updateBoard(gameState, "confirm"));

                        }}><Check className="h-full w-full" /></div>


                    </div>}
            </div>
        </div>
    </div>;

}

