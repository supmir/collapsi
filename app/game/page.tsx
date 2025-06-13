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
        <div className="w-full aspect-square grid grid-cols-6 gap-1">
            {[...Array(36)].map((_, i) => {
                return <div key={i} className={`h-full w-full ${[0, 5, 30, 35].includes(i) ? "bg-gray-500" : "bg-gray-700"}`}>
                    {convertToBoard(i)}
                </div>;
            })}

        </div>
    </div>;

}


function convertToBoard(i: number) {
    if ([0, 5, 30, 35].includes(i)) {
        return -1;
    } else if (i < 6) {
        return i + 24;
    } else if (i > 29) {
        return i - 24;
    } else if (i % 6 == 0) {
        return i + 4;
    } else if ((i - 5) % 6 == 0) {
        return i - 4;
    } else {
        return i;
    }
}