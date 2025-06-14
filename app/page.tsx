"use client";

import { GameState, initialiseGameState, Player, PlayerState, updateBoard } from "@/utils/engine";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, Crown, RotateCcw, Skull } from "lucide-react";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { addDoc, collection, doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { firestore } from "@/utils/firebase";


const servers = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
        },
        {
            urls: ['turn:relay1.expressturn.com:3480'],
            username: 'efPVTROUWWJ55A39IT',
            credential: 'yP21Uvqy20rU7Zgj',
        },
    ],
    iceCandidatePoolSize: 10,
};

export default function Game() {
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const gameDataChannelRef = useRef<RTCDataChannel | null>(null);
    const roomIdRef = useRef<HTMLInputElement | null>(null);


    const [roomId, setRoomId] = useState<string>("");

    const [gameState, setGameState] = useState<GameState>();
    const [playerNumber, setPlayerNumber] = useState<Player>(1);

    return roomId === "" ? <div className="h-screen w-screen flex p-2">
        <div className="flex flex-col max-w-lg m-auto w-full  gap-4">
            <button className="ring ring-white p-2" onClick={async () => {
                setPlayerNumber(1);
                pcRef.current = new RTCPeerConnection(servers);
                const pc = pcRef.current;
                pc.ondatachannel = (e) => {
                    e.channel.onmessage = (e) => {
                        console.log(e);
                        setGameState(JSON.parse(e.data));
                    };
                };
                gameDataChannelRef.current = pc.createDataChannel("game");
                const gameDataChannel = gameDataChannelRef.current;

                gameDataChannel.onmessage = (e) => {
                    console.log("Game Data Channel On Message");
                    console.log(e);
                };


                const roomRef = doc(collection(firestore, "rooms"));
                setRoomId(roomRef.id);
                console.log(roomRef.id);

                const offerCandidatesRef = collection(roomRef, "offerCandidates");
                const answerCandidatesRef = collection(roomRef, "answerCandidates");

                pc.onicecandidate = (e) => {
                    console.log("New Offer Ice Candidate");
                    console.log(e);
                    if (e.candidate) addDoc(offerCandidatesRef, e.candidate.toJSON());

                };


                // Create offer
                const offerDescription = await pc.createOffer();
                await pc.setLocalDescription(offerDescription);

                const offer = {
                    sdp: offerDescription.sdp,
                    type: offerDescription.type,
                };

                setDoc(roomRef, { offer });

                onSnapshot(roomRef, (snapshot) => {
                    const data = snapshot.data();
                    if (!pc.currentRemoteDescription && data?.answer) {
                        const answerDescription = new RTCSessionDescription(data.answer);
                        pc.setRemoteDescription(answerDescription);
                    }
                });

                onSnapshot(answerCandidatesRef, (snapshot) => {
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === 'added') {
                            const candidate = new RTCIceCandidate(change.doc.data());
                            pc.addIceCandidate(candidate);
                        }
                    });
                });

            }}>Open Room</button>

            <div className="w-full border my-4 border-neutral-400"></div>
            <input type="text" className="ring ring-white p-2" ref={roomIdRef} />
            <button className="ring ring-white p-2"
                onClick={async () => {
                    setPlayerNumber(2);
                    pcRef.current = new RTCPeerConnection(servers);
                    const pc = pcRef.current;
                    pc.ondatachannel = (e) => {
                        e.channel.onmessage = (e) => {
                            console.log(e);
                            setGameState(JSON.parse(e.data));
                        };
                    };
                    gameDataChannelRef.current = pc.createDataChannel("game");
                    const gameDataChannel = gameDataChannelRef.current;

                    gameDataChannel.onmessage = (e) => {
                        console.log("Game Data Channel On Message");
                        console.log(e);
                    };

                    if (!roomIdRef.current?.value) return;
                    const roomRef = doc(firestore, "rooms", roomIdRef.current.value);

                    const offerCandidatesRef = collection(roomRef, "offerCandidates");
                    const answerCandidatesRef = collection(roomRef, "answerCandidates");

                    pc.onicecandidate = (e) => {
                        console.log("New Answer Ice Candidate");
                        console.log(e);
                        if (e.candidate) addDoc(answerCandidatesRef, e.candidate.toJSON());

                    };

                    const roomDoc = await getDoc(roomRef);

                    if (!roomDoc.exists()) {
                        return;
                    }

                    const data = roomDoc.data();

                    const offerDescription = data.offer;
                    await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

                    const answerDescription = await pc.createAnswer();
                    await pc.setLocalDescription(answerDescription);


                    const answer = {
                        type: answerDescription.type,
                        sdp: answerDescription.sdp,
                    };

                    await updateDoc(roomRef, { answer });



                    onSnapshot(offerCandidatesRef, (snapshot) => {
                        snapshot.docChanges().forEach((change) => {
                            if (change.type === 'added') {
                                const candidate = new RTCIceCandidate(change.doc.data());
                                pc.addIceCandidate(candidate);
                            }
                        });
                    });
                    setRoomId(roomIdRef.current.value);
                    const initialGameState = initialiseGameState();
                    setGameState(initialGameState);

                    console.log("join room", gameState);
                    gameDataChannel.onopen = () => {
                        gameDataChannel.send(
                            JSON.stringify(initialGameState)
                        );
                    };
                }}
            >Join room</button>

            <a className="underline text-center" href="https://www.youtube.com/watch?v=6vYEHdjlw3g">Credit: Riffle Shuffle & Roll</a>
        </div>
    </div> : <div className="h-screen w-screen flex portrait:flex-col max-w-7xl mx-auto">
        <div className="landscape:w-2/3 portrait:h-2/3 max-h-screen max-w-screen object-center">

            {!gameState && <div className="h-full flex">
                <div className="text-xl sm:text-2xl md:text-4xl m-auto">

                    Waiting for player 2 to enter...
                </div>
            </div>}
            {gameState && <div className="aspect-square grid grid-cols-4 gap-1 p-4 m-auto max-h-full max-w-full">
                {gameState.board.map((val, i) => {
                    return <div
                        key={i} className={`aspect-square flex relative -z-30
                         ${val.type === "collapsed" && "bg-gray-900"}`
                        }>
                        <AnimatePresence>
                            {(val.type === "default" || val.type === "path" || gameState.player1.displayedPosition === i || gameState.player2.displayedPosition === i) && <motion.div
                                className="absolute h-full w-full bg-gray-500 -z-20"
                                initial={{
                                    opacity: 0, scale: 0
                                }}
                                animate={{
                                    opacity: 1, scale: 1, transition: {
                                        duration: 0.4,
                                        scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },

                                    }
                                }}
                                exit={{
                                    opacity: 0, scale: 0, transition: {
                                        duration: 0.7,
                                        scale: { type: "spring", visualDuration: 0.7, bounce: 0.5 },
                                    }
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
                            {gameState.player1.displayedPosition === i && <PlayerPiece playerState={gameState.player1} isTurn={gameState.turn === 1} className="bg-red-700 -z-10" />}
                            {gameState.player2.displayedPosition === i && <PlayerPiece playerState={gameState.player2} isTurn={gameState.turn === 2} className="bg-blue-700 -z-10" />}
                        </AnimatePresence>
                    </div>;
                })}
            </div>}
        </div>
        <div className="landscape:w-1/3 portrait:h-1/3 max-h-screen max-w-screen">
            <div className="landscape:h-full portrait:w-full flex flex-col">
                <div className="mx-auto">Room ID: {roomId}</div>
                {gameState && gameState.turn === playerNumber &&
                    <div className="grid grid-cols-3 gap-2 m-auto h-60 w-60">
                        {/* ROW 1 */}
                        <div></div>
                        <button className="bg-gray-700" onClick={() => {
                            if (!gameDataChannelRef.current) throw new Error("disconnected");
                            const newGameState = updateBoard(gameState, "up");
                            setGameState(newGameState);
                            gameDataChannelRef.current.send(
                                JSON.stringify(newGameState)
                            );
                        }}>
                            <ArrowUp className="h-full w-full" />
                        </button>
                        <div></div>

                        {/* ROW 2 */}
                        <div className=" bg-gray-700" onClick={() => {
                            if (!gameDataChannelRef.current) throw new Error("disconnected");
                            const newGameState = updateBoard(gameState, "left");
                            setGameState(newGameState);
                            gameDataChannelRef.current.send(
                                JSON.stringify(newGameState)
                            );

                        }}>
                            <ArrowLeft className="h-full w-full" />
                        </div>
                        <div className=" bg-gray-700" onClick={() => {
                            if (!gameDataChannelRef.current) throw new Error("disconnected");
                            const newGameState = updateBoard(gameState, "down");
                            setGameState(newGameState);
                            gameDataChannelRef.current.send(
                                JSON.stringify(newGameState)
                            );

                        }}>
                            <ArrowDown className="h-full w-full" />
                        </div>
                        <div className=" bg-gray-700" onClick={() => {
                            if (!gameDataChannelRef.current) throw new Error("disconnected");
                            const newGameState = updateBoard(gameState, "right");
                            setGameState(newGameState);
                            gameDataChannelRef.current.send(
                                JSON.stringify(newGameState)
                            );
                        }}>
                            <ArrowRight className="h-full w-full" />
                        </div>

                        {/* ROW 3 */}
                        <div className="bg-red-700" onClick={() => {
                            if (!gameDataChannelRef.current) throw new Error("disconnected");
                            const newGameState = updateBoard(gameState, "reset");
                            setGameState(newGameState);
                            gameDataChannelRef.current.send(
                                JSON.stringify(newGameState)
                            );

                        }}>
                            <RotateCcw className="h-full w-full" />
                        </div>
                        <div></div>
                        <div className="bg-green-700" onClick={() => {
                            if (!gameDataChannelRef.current) throw new Error("disconnected");
                            const newGameState = updateBoard(gameState, "confirm");
                            setGameState(newGameState);
                            gameDataChannelRef.current.send(
                                JSON.stringify(newGameState)
                            );
                        }}>
                            <Check className="h-full w-full" />
                        </div>


                    </div>}
            </div>
        </div>
    </div>;


}

interface PlayerPieceProps {
    playerState: PlayerState;
    isTurn: boolean;
    className: string;
}
function PlayerPiece(props: PlayerPieceProps) {
    const { playerState, className, isTurn } = props;

    return <motion.div
        className={`w-2/3 aspect-square m-auto flex`}
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