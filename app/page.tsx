"use client";

import { GameState, initialiseGameState, Player, PlayerAction, updateBoard } from "@/utils/engine";
import { Copy, CopyCheck } from "lucide-react";
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
    const [isCopied, setIsCopied] = useState<boolean>(false);


    function userActionRelay(action: PlayerAction) {
        if (!gameDataChannelRef.current) throw new Error("disconnected");
        if (!gameState) throw new Error("Game state not initialised");
        const newGameState = updateBoard(gameState, action);
        setGameState(newGameState);
        gameDataChannelRef.current.send(
            JSON.stringify(newGameState)
        );
    }

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
    </div> : <div className="flex portrait:flex-col max-w-7xl mx-auto justify-center">
        {!gameState &&
            <div className="text-xl sm:text-2xl md:text-4xl m-auto flex flex-col gap-4 h-screen w-screen justify-center">
                <div className="mx-auto">{waitingMessage}</div>
                <div className="mx-auto flex gap-2" >
                    <div>Room ID: {roomId}</div>
                    <button
                        className="my-auto ring ring-white p-1 h-6 aspect-square"
                        onClick={() => {
                            navigator.clipboard.writeText(roomId);
                            setIsCopied(true);
                            setTimeout(() => { setIsCopied(false); }, 3000);
                        }}>
                        {isCopied ? <CopyCheck className="h-full w-full" /> : <Copy className="h-full w-full" />}
                    </button>
                </div>
            </div>}
        {gameState && <div className="flex portrait:flex-col">
            <div className="landscape:h-screen portrait:w-screen aspect-square grid grid-cols-4 gap-1 p-4 max-h-full max-w-full overflow-clip">
                {gameState.board.map((_, i) => {
                    return <Square
                        key={i}
                        cardNumber={i}
                        gameState={gameState}
                        playerNumber={playerNumber}
                        updateBoard={userActionRelay}
                    />;
                })}
            </div>

            {gameState.phase === "end" && <div className="grid min-w-48 text-center landscape:my-auto gap-2 p-4">
                <div>You {playerNumber === 1 && gameState.player1.state === "winner" ? "win" : "lose"}!</div>
                <button className="ring ring-white">Play again!</button>
            </div>}
        </div>}
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
