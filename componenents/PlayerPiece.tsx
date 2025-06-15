import { PlayerState } from "@/utils/engine";
import { Crown, Skull } from "lucide-react";
import { motion } from "motion/react";

interface PlayerPieceProps {
    playerState: PlayerState;
    isTurn: boolean;
    className: string;
}
export default function PlayerPiece(props: PlayerPieceProps) {
    const { playerState, className, isTurn } = props;

    return <motion.div
        className={`w-2/3 aspect-square m-auto flex z-20`}
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
    >
        <div className={`m-auto p-1 sm:p-2 xl:p-4 rounded-full ${className} w-3/4 h-3/4`}
            style={{
                animation: ((isTurn && playerState.state !== "loser") || playerState.state === "winner") ? "breathe 0.4s ease-in-out infinite" : "",
            }}>
            {playerState.state === "winner" &&
                <Crown className="h-full w-full" />
            }
            {playerState.state === "loser" &&
                <Skull className="h-full w-full" />
            }
            {
                (playerState.state === "default" || playerState.state === "start") &&
                <div className="h-full w-full flex">
                    <span className="font-black text-2xl m-auto">{playerState.steps}</span>
                </div>
            }
        </div>
    </motion.div >;
}

