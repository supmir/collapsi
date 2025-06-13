"use client";
import { useState } from "react";


interface CardState {
    number: 0 | 1 | 2 | 3 | 4;
    isCollapsed: boolean;
}

interface PlayerState {
    state: "default" | "winner" | "loser";
    position: number;
}


export default function Game() {

    const [player1, setPlayer1] = useState<PlayerState>(
        { position: 9, state: "default" }
    );
    const [player2, setPlayer2] = useState<PlayerState>(
        { position: 7, state: "default" }
    );
    const [board, _] = useState(sample
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value));


    return <div className="h-screen flex portrait:flex-col">
        <div className="">
            <div className="aspect-square grid grid-cols-4 gap-1 p-4 landscape:h-screen portrait:w-screen m-auto">
                {board.map((val, i) => {
                    return <div key={i} className={` bg-gray-500 aspect-square`}>
                        {i}, {val.number}, {val.isCollapsed + ""}
                        {player1.position === i && <div className="w-1/2 aspect-square bg-red-700 mx-auto"></div>}
                        {player2.position === i && <div className="w-1/2 aspect-square bg-blue-700 mx-auto"></div>}
                    </div>;
                })}
            </div>
        </div>
        <div className="landscape:w-1/2">
            <div className="landscape:h-screen portrait:w-screen flex">
                <div className="grid grid-cols-3 gap-2 m-auto aspect-square h-60">
                    <div></div>
                    <div className="h-20 bg-emerald-700" onClick={() => {
                        setPlayer1({
                            ...player1,
                            position: player1.position - 4 < 0 ? player1.position + 12 : player1.position - 4
                        });
                    }}>up</div>
                    <div></div>
                    <div className="h-20 bg-emerald-700" onClick={() => {
                        setPlayer1({
                            ...player1,
                            position: player1.position % 4 === 0 ? player1.position + 3 : player1.position - 1
                        });
                    }}>left</div>
                    <div className="h-20 bg-emerald-700">reset</div>
                    <div className="h-20 bg-emerald-700" onClick={() => {
                        setPlayer1({
                            ...player1,
                            position: (player1.position - 3) % 4 === 0 ? player1.position - 3 : player1.position + 1
                        });
                    }}>right</div>
                    <div></div>
                    <div className="h-20 bg-emerald-700" onClick={() => {
                        setPlayer1({
                            ...player1,
                            position: player1.position + 4 > 15 ? player1.position - 12 : player1.position + 4
                        });
                    }}
                    >down</div>
                    <div></div>

                </div>
            </div>
        </div>
    </div>;

}



const sample: CardState[] = [
    { number: 0, isCollapsed: false },

    { number: 1, isCollapsed: false },
    { number: 1, isCollapsed: false },
    { number: 1, isCollapsed: false },
    { number: 1, isCollapsed: false },

    { number: 2, isCollapsed: false },
    { number: 2, isCollapsed: false },
    { number: 2, isCollapsed: false },
    { number: 2, isCollapsed: false },

    { number: 3, isCollapsed: false },
    { number: 3, isCollapsed: false },
    { number: 3, isCollapsed: false },
    { number: 3, isCollapsed: false },


    { number: 4, isCollapsed: false },
    { number: 4, isCollapsed: false },

    { number: 0, isCollapsed: false },
];