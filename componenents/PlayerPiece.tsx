import { PlayerAction, PlayerState } from "@/utils/engine";
import { Check, Crown, Skull } from "lucide-react";
import { motion } from "motion/react";

interface PlayerPieceProps {
    playerState: PlayerState;
    isTurn: boolean;
    className: string;
    updateBoard: (action: PlayerAction) => void;

}
export default function PlayerPiece(props: PlayerPieceProps) {
    const { playerState, className, isTurn, updateBoard } = props;

    return <motion.button
        className={`w-full h-full flex z-20`}
        // initial={{ opacity: 0, scale: 0 }}
        // animate={{ opacity: 1, scale: 1 }}
        // exit={{ opacity: 0, scale: 0 }}

        // transition={{
        //     duration: 0.4,
        //     scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
        // }}

        key={"player" + className}
        layout
        layoutId={"player" + className}
        transition={
            {
                type: "spring",
                damping: 20,
                stiffness: 300,
            }

        }
        onClick={() => {
            updateBoard("confirm");
        }}
    >
        <div className={`w-4/6 m-auto `}
            style={{
                animation: ((isTurn && playerState.state !== "loser") || playerState.state === "winner") ? "breathe 0.4s ease-in-out infinite" : "",
            }}
        >
            {playerState.state === "winner" &&
                <Crown className={`h-full w-full rounded-full ${className}`} />
            }
            {playerState.state === "loser" &&
                <Skull className={`h-full w-full rounded-full ${className}`} />
            }
            {
                (playerState.state === "default" || playerState.state === "start") && playerState.steps === 0 &&
                <>
                    <Check className={`h-full w-full p-4 rounded-full ${className}`} />
                    <div>End Turn</div>
                </>
            }
            {(playerState.state === "default" || playerState.state === "start") && playerState.steps !== 0 &&
                <div className={`h-full aspect-square p-4 rounded-full flex ${className}`}>
                    <span className="font-black text-2xl m-auto">{playerState.steps}</span>
                </div>
            }
        </div>

    </motion.button >;
}


{/* <div className="h-full w-full flex">
<span className="font-black text-2xl m-auto">{playerState.steps}</span>
</div> */}
;
