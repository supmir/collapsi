import { PlayerAction, PlayerState } from "@/utils/engine";
import { Crown, Skull } from "lucide-react";
import { AnimationGeneratorType, motion } from "motion/react";

interface PlayerPieceProps {
    playerState: PlayerState;
    isTurn: boolean;
    className: string;
    updateBoard: (action: PlayerAction) => void;

}
export default function PlayerPiece(props: PlayerPieceProps) {
    const { playerState, className, updateBoard } = props;

    // const animate = {
    //     scale: 1, transition: {
    //         scale: {
    //             type: "spring" as AnimationGeneratorType,
    //             delay: 0.1,
    //             visualDuration: 1
    //         }
    //     }
    // };
    const animate = {
        fill: "#fff", transition: {
            fill: {
                type: "spring" as AnimationGeneratorType,
                delay: 0.1,
                visualDuration: 1
            }
        }
    };

    const initial = { fill: "#000" };
    const variants = {
        noFill: initial,
        fill: animate
    };

    return <motion.button
        className={`w-full h-full flex z-50`}
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
                    {4 === playerState.fullSteps && <svg xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 26 26"
                        width={25}
                        height={25}
                        className={`h-full w-full p-1 fill-none stroke-white ${playerState.steps === 0 && "animate-wiggle" || ""}`}
                        aria-hidden="true"
                    // animate={`animate-${playerState.fullSteps - playerState.steps}/${playerState.fullSteps}`}
                    >
                        <motion.path
                            initial={initial}
                            animate={(playerState.fullSteps - playerState.steps) > 0 ? "fill" : "noFill"}
                            variants={variants}
                            d="M14 2A10 10 0 0124 12H14Z" />
                        <motion.path
                            initial={initial}
                            animate={(playerState.fullSteps - playerState.steps) > 1 ? "fill" : "noFill"}
                            variants={variants}
                            d="M24 14A10 10 0 0114 24V14Z" />
                        <motion.path
                            initial={initial}
                            animate={(playerState.fullSteps - playerState.steps) > 2 ? "fill" : "noFill"}
                            variants={variants}
                            d="M12 24A10 10 0 012 14H12Z" />
                        <motion.path
                            initial={initial}
                            animate={(playerState.fullSteps - playerState.steps) > 3 ? "fill" : "noFill"}
                            variants={variants}
                            d="M2 12A10 10 0 0112 2V12Z" />


                    </svg>}
                    {3 === playerState.fullSteps &&
                        <svg xmlns="http://www.w3.org/2000/svg"
                            viewBox="1 1 24 24"
                            width={25}
                            height={25}
                            className={`h-full w-full p-1 fill-none stroke-white ${playerState.steps === 0 && "animate-wiggle" || ""}`}
                            aria-hidden="true"
                        // animate={`animate-${playerState.fullSteps - playerState.steps}/${playerState.fullSteps}`}
                        >
                            <motion.path
                                initial={initial}
                                animate={3 === playerState.fullSteps && (playerState.fullSteps - playerState.steps) > 0 ? "fill" : "noFill"}
                                variants={variants}
                                d="M14 2A10 10 0 0122.66 17L14 12Z" />
                            <motion.path
                                initial={initial}
                                animate={3 === playerState.fullSteps && (playerState.fullSteps - playerState.steps) > 1 ? "fill" : "noFill"}
                                variants={variants}
                                d="M21.66 19A10 10 0 014.34 19L13 14Z" />
                            <motion.path
                                initial={initial}
                                animate={3 === playerState.fullSteps && (playerState.fullSteps - playerState.steps) > 2 ? "fill" : "noFill"}
                                variants={variants}
                                d="M3.34 17A10 10 0 0112 2L12 12Z" />
                        </svg>
                    }
                    {2 === playerState.fullSteps && <svg xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 26 26"
                        width={25}
                        height={25}
                        className={`h-full w-full p-1 fill-none stroke-white ${playerState.steps === 0 && "animate-wiggle" || ""}`}
                        aria-hidden="true"
                    // animate={`animate-${playerState.fullSteps - playerState.steps}/${playerState.fullSteps}`}
                    >
                        <motion.path
                            initial={initial}
                            animate={(playerState.fullSteps - playerState.steps) > 0 ? "fill" : "noFill"}
                            variants={variants}
                            d="M14 3A10 10 0 0114 23Z" />
                        <motion.path
                            initial={initial}
                            animate={(playerState.fullSteps - playerState.steps) > 1 ? "fill" : "noFill"}
                            variants={variants}
                            d="M12 23A10 10 0 0112 3Z" />



                    </svg>}
                    {1 === playerState.fullSteps && <svg xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 26 26"
                        width={25}
                        height={25}
                        className={`h-full w-full p-1 fill-none stroke-white ${playerState.steps === 0 && "animate-wiggle" || ""}`}
                        aria-hidden="true"
                    // animate={`animate-${playerState.fullSteps - playerState.steps}/${playerState.fullSteps}`}
                    >
                        <motion.path
                            initial={initial}
                            animate={(playerState.fullSteps - playerState.steps) > 0 ? "fill" : "noFill"}
                            variants={variants}
                            d="M13 3A10 10 0 0113 23 10 10 0 0113 3Z" />

                    </svg>}
                </div>
            }
        </div>

    </motion.button >;
}


{/* <div className="h-full w-full flex">
<span className="font-black text-2xl m-auto">{playerState.steps}</span>
</div> */}
;
