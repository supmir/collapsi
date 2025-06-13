interface CardState {
    number: 0 | 1 | 2 | 3 | 4;
    isCollapsed: boolean;
    player1?: PlayerState,
    player2?: PlayerState,
}

interface PlayerState {
    state: "default" | "winner" | "loser";
}


export default function Game() {

    const sample: CardState[] = [
        { number: 0, isCollapsed: false, player1: { state: "default" } },

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

        { number: 0, isCollapsed: false, player2: { state: "default" } },
    ];


    return <div className="">
        <div className="w-full aspect-square grid grid-cols-4 gap-1 p-4">
            {sample.map((val, i) => {
                return <div key={i} className={`h-full w-full bg-gray-500 aspect-square`}>
                    {i}, {val.number}, {val.isCollapsed + ""}
                    {val.player1?.state === "default" && <div className="w-1/2 aspect-square bg-red-700 mx-auto"></div>}
                    {val.player2?.state === "default" && <div className="w-1/2 aspect-square bg-blue-700 mx-auto"></div>}
                </div>;
            })}

        </div>
    </div>;

}