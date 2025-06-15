import { PlayerAction, PlayerState } from "@/utils/engine";
import { Check, Crown, Skull } from "lucide-react";
import { motion, VariantLabels } from "motion/react";

interface PlayerPieceProps {
    playerState: PlayerState;
    isTurn: boolean;
    className: string;
    updateBoard: (action: PlayerAction) => void;

}
export default function PlayerPiece(props: PlayerPieceProps) {
    const { playerState, className, isTurn, updateBoard } = props;
    const transition = {
        pathLength: { delay: 2, duration: 2 },
        stroke: { duration: 2 }
    };

    const variants = {
        "animate-0/1": { pathLength: 0.0, transition: transition },
        "animate-0/2": { pathLength: 0.0, transition: transition },
        "animate-0/3": { pathLength: 0.0, transition: transition },
        "animate-0/4": { pathLength: 0.0, stroke: "#fff", transition: transition },
        "animate-1/2": { pathLength: 0.5, transition: transition },
        "animate-1/3": { pathLength: 0.3333, transition: transition },
        "animate-1/4": { pathLength: 0.25, stroke: "#000", transition: transition },
        "animate-2/2": { pathLength: 1.0, transition: transition },
        "animate-2/3": { pathLength: 0.6666, transition: transition },
        "animate-2/4": { pathLength: 0.5, stroke: "#fff", transition: transition },
        "animate-3/3": { pathLength: 1.0, transition: transition },
        "animate-3/4": { pathLength: 0.75, stroke: "#000", transition: transition },
        "animate-4/4": { pathLength: 1.0, stroke: "#fff", transition: transition },
    };
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
                // animation: ((isTurn && playerState.state !== "loser") || playerState.state === "winner") ? "breathe 0.4s ease-in-out infinite" : "",
                animation: playerState.state === "winner" ? "breathe 0.4s ease-in-out infinite" : "",
            }}
        >
            {playerState.state === "winner" &&
                <Crown className={`h-full w-full rounded-full p-2 ${className}`} />
            }
            {playerState.state === "loser" &&
                <Skull className={`h-full w-full rounded-full p-2 ${className}`} />
            }
            {(playerState.state === "default" || playerState.state === "start") &&
                <div className={`h-full aspect-square p-4 rounded-full flex flex-col ${className}`}>
                    <motion.svg xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width={24}
                        height={24}
                        stroke="#fff"
                        className="h-full w-full p-1 fill-none"
                        aria-hidden="true"
                        layout
                        layoutId={"player-path-" + className}
                        animate={`animate-${playerState.fullSteps - playerState.steps}/${playerState.fullSteps}`}
                        variants={variants}
                    >
                        <path d="M12 2A10 10 0 0122 12 10 10 0 0112 22 10 10 0 012 12 10 10 0 0112 2"></path>

                        {/* <motion.circle
                            layout
                            layoutId={"player-path-" + className}
                            cx="12"
                            cy="12"
                            r="10"
                            variants={variants}
                        /> */}

                    </motion.svg>
                    {/* <span className="font-black text-2xl m-auto">{playerState.steps}/{playerState.fullSteps}</span> */}
                </div>
            }
        </div>

    </motion.button >;
}


{/* <div className="h-full w-full flex">
<span className="font-black text-2xl m-auto">{playerState.steps}</span>
</div> */}
;
