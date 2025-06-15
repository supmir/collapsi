"use client";

import { GameState, initialiseGameState, Player, updateBoard } from "@/utils/engine";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import { addDoc, collection, doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { firestore } from "@/utils/firebase";
import Square from "@/componenents/Square";

const servers = {
    iceServers: [
        // Public STUN
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
        },
        {
            urls: ['turn:relay1.expressturn.com:3480'],
            username: 'efPVTROUWWJ55A39IT',
            credential: 'yP21Uvqy20rU7Zgj',
        },
        {
            urls: 'stun:stun.relay.metered.ca:80',
        },
        {
            urls: 'turn:global.relay.metered.ca:80',
            username: '8afc8786fa0f024dedc127a4',
            credential: 'DPJTy0I0lS1c+LpE',
        },
        {
            urls: 'turn:global.relay.metered.ca:80?transport=tcp',
            username: '8afc8786fa0f024dedc127a4',
            credential: 'DPJTy0I0lS1c+LpE',
        },
        {
            urls: 'turn:global.relay.metered.ca:443',
            username: '8afc8786fa0f024dedc127a4',
            credential: 'DPJTy0I0lS1c+LpE',
        },
        {
            urls: 'turns:global.relay.metered.ca:443?transport=tcp',
            username: '8afc8786fa0f024dedc127a4',
            credential: 'DPJTy0I0lS1c+LpE',
        }
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
    const [waitingMessage, setWaitingMessage] = useState<string>("");

    return roomId === "" ? <div className="h-screen w-screen flex p-2">
        <div className="flex flex-col max-w-lg m-auto w-full  gap-4">
            <button className="ring ring-white p-2" onClick={async () => {
                setWaitingMessage("Waiting for player 2 to enter...");
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


                const roomRef = doc(firestore, "rooms", generateRoomCode());
                setRoomId(roomRef.id);
                console.log(roomRef.id);

                const offerCandidatesRef = collection(roomRef, "offerCandidates");
                const answerCandidatesRef = collection(roomRef, "answerCandidates");

                pc.onicecandidate = (e) => {
                    console.log("New Offer Ice Candidate");
                    console.log(e.candidate?.candidate);
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
                    setWaitingMessage("Entering the room...");
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
                        console.log(e.candidate?.candidate);
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
                    gameDataChannel.onopen = () => {
                        const initialGameState = initialiseGameState(1);
                        setGameState(initialGameState);
                        console.log("join room", gameState);
                        gameDataChannel.send(
                            JSON.stringify(initialGameState)
                        );
                    };
                }}
            >Join room</button>

            <a className="underline text-center" href="https://www.youtube.com/watch?v=6vYEHdjlw3g">Credit: Riffle Shuffle & Roll</a>
        </div>
    </div> : <div className="h-screen w-screen flex portrait:flex-col max-w-7xl mx-auto">
        <div className="landscape:w-2/3 portrait:h-2/3 max-h-screen max-w-screen object-center overflow-clip">
            {!gameState && <div className="h-full flex">
                <div className="text-xl sm:text-2xl md:text-4xl m-auto">
                    {waitingMessage}
                </div>
            </div>}
            {gameState && <div className="aspect-square grid grid-cols-4 gap-1 p-4 m-auto max-h-full max-w-full">
                {gameState.board.map((cardState, i) => {
                    return <Square
                        key={i}
                        cardState={cardState}
                        playerState={gameState.player1.displayedPosition === i ?
                            gameState.player1 :
                            (gameState.player2.displayedPosition === i ?
                                gameState.player2 :
                                undefined)}
                        turn={gameState.turn}
                    />;
                })}
            </div>}
        </div>
        <div className="landscape:w-1/3 portrait:h-1/3 max-h-screen max-w-screen">
            <div className="landscape:h-full portrait:w-full flex flex-col items-center gap-2 py-4">
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
                {gameState && gameState.phase === "end" &&
                    <>
                        <div className="text-2xl font-black">Player {gameState.player1.state === "winner" ? "1" : "2"} wins!</div>
                        <button
                            className="ring ring-white p-2"
                            onClick={() => {
                                const initialGameState = initialiseGameState(gameState.player1.state === "winner" ? 2 : 1);
                                setGameState(initialGameState);
                                if (gameDataChannelRef.current)
                                    gameDataChannelRef.current.send(
                                        JSON.stringify(initialGameState)
                                    );

                            }}
                        >Play again</button>
                    </>
                }
                <div className="mx-auto">Room ID: {roomId}</div>
                <div className="mx-auto">Connection State: {pcRef.current?.connectionState}</div>
            </div>
        </div>
    </div>;


}


function generateRoomCode(length = 4): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return code;
}
