// Import CSS styles, and necessary modules from packages
import styles from "../styles/NftMinter.module.css";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAccount, useSigner, useSignMessage } from "wagmi";
import { Contract, utils } from 'ethers';
import { verifyMessage } from "ethers/lib/utils";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// NFT Minter component
export default function NftMinter({
    contractAddress,
    tokenUri,
    abi,
    contentSrc,
    contentType,
}) {
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Get the user's wallet address and status of their connection to it
    const { address, isDisconnected } = useAccount({
        onDisconnect() {
            reset();
        },
    });

    const [isMounted, setIsMounted] = useState(false);
    const [nonce, setNonce] = useState("");
    const [passportScore, setPassportScore] = useState(0);
    const [checked, setChecked] = useState(false);

    // Get the signer instance for the connected wallet
    const { data: signer } = useSigner();
    // State hooks to track the transaction hash and whether or not the NFT is being minted
    const [txHash, setTxHash] = useState();
    const [isMinting, setIsMinting] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    const [amount, setAmount] = useState(1);

    const addToAllowList = async () => {
        setNonce("");
        setPassportScore(0);

        //step 1
        const scorerMessageResponse = await axios.get("/api/scorer-message");

        if (scorerMessageResponse.status !== 200) {
            console.error("failed to fetch scorer message")
            return;
        }
        setNonce(scorerMessageResponse.data.nonce);

        //step 2

        try {

            setIsChecking(true);

            signMessage({ message: scorerMessageResponse.data.message });

        } catch (e) {
            console.log(e);
            setIsChecking(false);
        }
    }

    const { signMessage } = useSignMessage({
        async onSuccess(data, variables) {
            const address = verifyMessage(variables.message, data);

            //step 3
            const submitResponse = await axios.post("/api/submit-passport", {
                address: address, // Required: The user's address you'd like to score.
                community: process.env.NEXT_PUBLIC_SCORER_ID, // Required: get this from one of your scorers in the Scorer API dashboard https://scorer.gitcoin.co/
                signature: data, // Optional: The signature of the message returned in Step #1
                nonce: nonce, // Optional: The nonce returned in Step #1
            });

            //step 4
            const scoreResponse = await axios.get(
                `/api/allowList/add/${process.env.NEXT_PUBLIC_SCORER_ID}/${address}`
            );

            //check status
            if (scoreResponse.data.status === "ERROR") {
                setPassportScore(0);
                toast.error(scoreResponse.data.error);
                return;
            }

            setPassportScore(scoreResponse.data.score);
            setChecked(true);

            if (scoreResponse.data.score < 1) {
                toast.error("Sorry, you're not eligible for the FreeMint.");
            } else {
                toast.success("You're eligible for the FreeMint! Happy minting.");
            }
        },
    });

    // Function to mint a new NFT
    const mintNFT = async () => {

        // Create a new instance of the NFT contract using the contract address and ABI
        const nftContract = new Contract(contractAddress, abi, signer);
        try {
            // Set isMinting to true to show that the transaction is being processed
            setIsMinting(true);
            // Call the smart contract function to mint a new NFT with the provided token URI and the user's address
            // const mintTx = await nftContract.mintPunk(amount, { value: utils.parseEther("0.002023") });
            const mintTx = await nftContract.mintPunk(amount);
            // Set the transaction hash in state to display in the UI
            setTxHash(mintTx?.hash);
            // Wait for the transaction to be processed
            await mintTx.wait();
            // Reset isMinting and txHash in state
            setIsMinting(false);
            setTxHash(null);
        } catch (e) {
            // If an error occurs, log it to the console and reset isMinting to false
            console.log(e);
            setIsMinting(false);
        }
    };

    function reset() {
        setNonce("");
        setPassportScore(0);
        setChecked(false);
    }

    function display() {
        if (isMounted && address) {
            if (checked) {
                if (passportScore < 1) {
                    return (
                        <div>
                            <p className={styles.p}>
                                Your score isn&apos;t high enough, collect more stamps to
                                qualify.
                            </p>
                            <p style={{ marginTop: "20px" }} className={styles.p}>
                                Passport Score:{" "}
                                <span style={{ color: "rgb(111 63 245" }}>
                                    {passportScore | 0}
                                </span>
                                /1
                            </p>
                            <div style={{ marginTop: "10px" }}>
                                <a
                                    className={styles.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    href="https://passport.gitcoin.co"
                                >
                                    Click here to increase your score.
                                </a>
                            </div>
                        </div>
                    );
                } else {
                    return (
                        <div className={styles.page_flexBox}>
                            <div className={styles.page_container}>
                                <div className={styles.nft_media_container}>
                                    {contentType == "video" ? (
                                        <video className={styles.nft_media} autoPlay={true}>
                                            <source src={contentSrc} type="video/mp4" />
                                        </video>
                                    ) : (
                                        <img src={contentSrc} className={styles.nft_media} />
                                    )}
                                </div>

                                <div className={styles.nft_info}>
                                    <h1 className={styles.nft_title}>Scroll Punk 2023</h1>
                                    <h3 className={styles.nft_author}>By ScrollPunks.eth</h3>
                                    <p style={{ marginTop: "20px" }} className={styles.p}>
                                        Current Passport Score:{" "}
                                        <span style={{ color: "rgb(111 63 245" }}>
                                            {passportScore | 0}
                                        </span>
                                    </p>
                                    <hr className={styles.break} />
                                    <h3 className={styles.nft_instructions_title}>INSTRUCTIONS</h3>
                                    <p className={styles.text}>
                                        This NFT is on Scroll Alpha. You’ll need some test ETH to mint the
                                        NFT. <a href="https://bwarelabs.com/faucets/scroll-testnet">Get free test ETH</a>
                                    </p>
                                    {isDisconnected ? (
                                        <p>Connect your wallet to get started</p>
                                    ) : !txHash ? (
                                        <button
                                            className={`${styles.button} ${isMinting && `${styles.isMinting}`
                                                }`}
                                            disabled={isMinting}
                                            onClick={async () => await mintNFT()}
                                        >
                                            {isMinting ? "Minting" : "Mint Now"}
                                        </button>
                                    ) : (
                                        <div>
                                            <h3 className={styles.attribute_input_label}>TX ADDRESS</h3>
                                            <a
                                                href={`https://blockscout.scroll.io/tx/${txHash}`}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <div className={styles.address_container}>
                                                    <div>
                                                        {txHash.slice(0, 6)}...{txHash.slice(6, 10)}
                                                    </div>
                                                    <img
                                                        src={
                                                            "https://static.alchemyapi.io/images/cw3d/Icon%20Large/etherscan-l.svg"
                                                        }
                                                        width="20px"
                                                        height="20px"
                                                    />
                                                </div>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                }
            } else {
                return (
                    <div className={styles.page_flexBox}>
                        <div className={styles.page_container}>
                            <div className={styles.nft_media_container}>
                                {contentType == "video" ? (
                                    <video className={styles.nft_media} autoPlay={true}>
                                        <source src={contentSrc} type="video/mp4" />
                                    </video>
                                ) : (
                                    <img src={contentSrc} className={styles.nft_media} />
                                )}
                            </div>

                            <div className={styles.nft_info}>
                                <h1 className={styles.nft_title}>Scroll Punk 2023</h1>
                                <h3 className={styles.nft_author}>By ScrollPunks.eth</h3>
                                <p style={{ marginTop: "20px" }} className={styles.p}>
                                    Current Passport Score:{" "}
                                    <span style={{ color: "rgb(111 63 245" }}>
                                        {passportScore | 0}
                                    </span>
                                </p>
                                <hr className={styles.break} />
                                <h3 className={styles.nft_instructions_title}>INSTRUCTIONS</h3>
                                <p className={styles.text}>
                                    This NFT is on Scroll Alpha. You’ll need some test ETH to mint the
                                    NFT. <a href="https://bwarelabs.com/faucets/scroll-testnet">Get free test ETH</a>
                                </p>
                                <button
                                    className={`${styles.button} ${isChecking && `${styles.isMinting}`
                                        }`}
                                    disabled={isChecking}
                                    onClick={async () => await addToAllowList(address)}
                                >
                                    {isChecking ? "Checking Your Score..." : "Check Gitcoin Passport Score"}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }
        } else {
            return (
                <p className={styles.p}>
                    Connect your wallet to find out if you&apos;re eligible for the
                    FreeMint.
                </p>
            )
        }
    }

    return <div>{display()}</div>;
}