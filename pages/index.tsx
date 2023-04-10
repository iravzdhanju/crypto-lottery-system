import type { NextPage } from "next";
import Head from "next/head";

import {
  useContract,
  useMetamask,
  useDisconnect,
  useAddress,
  useContractRead,
  useContractWrite,
} from "@thirdweb-dev/react";
import {} from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import CountdownTimer from "../components/CountdownTimer";
import Marquee from "react-fast-marquee";
import PropagateLoader from "react-spinners/PropagateLoader";
import Login from "../components/Login";
import toast from "react-hot-toast";

import AdminControls from "../components/AdminControls";
import { currency } from "../constants";

const Home: NextPage = () => {
  const address = useAddress();
  const [userTickets, setUserTickets] = useState(0);
  const [quantity, setQuantity] = useState<number>(1);
  const { contract, isLoading } = useContract(
    process.env.NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS
  );
  const { data: expiration } = useContractRead(contract, "expiration");
  const { data: lastWinner } = useContractRead(contract, "lastWinner");
  const { data: lastWinnerAmount } = useContractRead(
    contract,
    "lastWinnerAmount"
  );
  const { data: ticketPrice } = useContractRead(contract, "ticketPrice");
  const { data: remainingTickets } = useContractRead(
    contract,
    "RemainingTickets"
  );
  const { data: tickets } = useContractRead(contract, "getTickets");

  const { mutateAsync: BuyTickets } = useContractWrite(contract, "BuyTickets");

  const { data: currentWinningReward } = useContractRead(
    contract,
    "CurrentWinningReward"
  );
  const { data: isLotteryOperator } = useContractRead(
    contract,
    "lotteryOperator"
  );

  const { mutateAsync: WithdrawWinnings } = useContractWrite(
    contract,
    "WithdrawWinnings"
  );

  const { data: winnings } = useContractRead(
    contract,
    "getWinningsForAddress",
    [address]
  );

  console.log(winnings?.toString());

  useEffect(() => {
    if (!tickets) return;

    const totalTickets: string[] = tickets;

    const noOfUserTickets = totalTickets.reduce(
      (total, ticketAddress) => (ticketAddress === address ? total + 1 : total),
      0
    );

    setUserTickets(noOfUserTickets);
  }, [tickets, address]);

  const handleClick = async () => {
    if (!ticketPrice) return;

    const notification = toast.loading("Buying your tickets...");
    try {
      // const data = await BuyTickets({
      //   args: [
      //     {
      //       value: ethers.utils.parseEther(
      //         (
      //           Number(ethers.utils.formatEther(ticketPrice)) * quantity
      //         ).toString()
      //       ),
      //     },
      //   ],
      // });
      //
      //
      // const data = await BuyTickets([
      //   {
      //     value: ethers.utils.parseEther(
      //       (
      //         Number(ethers.utils.formatEther(ticketPrice)) * quantity
      //       ).toString()
      //     ),
      //   },
      // ]);

      // const data = await BuyTickets({
      //   value: ethers.utils.parseEther(
      //     (Number(ethers.utils.formatEther(ticketPrice)) * quantity).toString()
      //   ),
      // });
      const data = await BuyTickets({
        overrides: {
          value: ethers.utils.parseEther(
            (
              Number(ethers.utils.formatEther(ticketPrice)) * quantity
            ).toString()
          ),
        },
      });
      toast.success("Tickets purchased successfully!", {
        id: notification,
      });

      console.info("contract call successs", data);
    } catch (err) {
      toast.error("Whoops something went wrong!", {
        id: notification,
      });

      console.error("contract call failure", err);
    }
  };

  if (isLoading)
    return (
      <div className="bg-[#1c1c1cd5] h-screen flex flex-col items-center justify-center">
        <div className="flex items-center space-x-2 mb-10">
          <h1 className="text-lg text-white font-bold">Loading ...</h1>
        </div>
        <PropagateLoader color="white" size={30} />
      </div>
    );

  const onWithdrawWinnings = async () => {
    const notification = toast.loading("Withdrawing winnings...");

    try {
      const data = await WithdrawWinnings({});

      toast.success("Winnings withdrawn successfully!", {
        id: notification,
      });

      console.info("contract call successs", data);
    } catch (err) {
      toast.error("Whoops something went wrong!", {
        id: notification,
      });

      console.error("contract call failure", err);
    }
  };

  if (!address) return <Login />;

  return (
    <div className="bg-[#0f0f0f] min-h-screen flex flex-col">
      <Head>
        <title>Lottery</title>
      </Head>

      <div className="flex-1">
        <Header />
        <Marquee className="bg-[#080808] p-5 mb-5" gradient={false} speed={100}>
          <div className="flex space-x-2 mx-10">
            <h4 className="text-white font-bold">
              Last Winner: {lastWinner?.toString()}
            </h4>
            <h4 className="text-white font-bold">
              Previous Winnings:{" "}
              {lastWinnerAmount &&
                ethers.utils.formatEther(lastWinnerAmount?.toString())}{" "}
              {currency}
            </h4>
          </div>
        </Marquee>

        {isLotteryOperator === address && (
          <div className="flex justify-center">
            <AdminControls />
          </div>
        )}

        {/*  */}
        {winnings > 0 && (
          <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto mt-5 text-white">
            <button
              onClick={onWithdrawWinnings}
              className="p-5 bg-gradient-to-b from-purple-500 to-purple-600 animate-pulse text-center rounded-xl w-full"
            >
              {/*  */}
              <p className="font-bold ">Winner </p>
              <p>
                Total Winnings: {ethers.utils.formatEther(winnings.toString())}{" "}
                {currency}
              </p>
              <br />
              <p className="font-semibold">Click here to withdraw</p>
            </button>
          </div>
        )}

        <div className="space-y-5 md:space-y-0 m-5 md:flex md:flex-row items-start justify-center md:space-x-5 ">
          <div className="stats-container">
            <h1 className="text-5xl mb-5 text-white font-semibold text-center">
              The Next Draw
            </h1>
            <div className="flex justify-between p-2 space-x-2">
              <div className="stats">
                <h2 className="text-sm">Total Pool</h2>
                <p className="text-xl">
                  {currentWinningReward &&
                    ethers.utils.formatEther(
                      currentWinningReward?.toString()
                    )}{" "}
                  {currency}
                </p>
              </div>
              <div className="stats">
                <h2 className="text-sm">Tickets Remaining</h2>
                <p className="text-xl">{remainingTickets?.toNumber()}</p>
              </div>
            </div>
            <div className="mt-5 mb-3">
              <CountdownTimer />
            </div>
          </div>

          <div className="stats-container space-y-2">
            <div className="stats-container">
              <div className="flex justify-between items-center text-white pb-2">
                <h2 className="">Price per Ticket</h2>
                <p>
                  {ticketPrice &&
                    ethers.utils.formatEther(ticketPrice?.toString())}{" "}
                  {currency}
                </p>
              </div>

              {/*  */}
              <div className="flex text-white items-center space-x-2 bg-[#000000] border-[#303332] border p-4">
                <p>TICKETS</p>
                <input
                  type="number"
                  className="flex w-full bg-transparent text-right outline-none"
                  placeholder="0.00"
                  min={1}
                  max={10}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2 mt-5">
                <div className="flex items-center justify-between text-gray-300 text-sm italic font-extrabold">
                  <p>Total Cost of Tickets</p>
                  <p>
                    {ticketPrice &&
                      Number(
                        ethers.utils.formatEther(ticketPrice?.toString())
                      ) * quantity}{" "}
                    {currency}
                  </p>
                </div>

                <div className="flex items-center justify-between text-gray-300 text-xs italic">
                  <p>Service Fees</p>
                  <p>0.001 {currency}</p>
                </div>

                <div className="flex items-center justify-between text-gray-300 text-xs italic">
                  <p>+ Network Fees</p>
                  <p>TBC</p>
                </div>
              </div>

              <button
                onClick={handleClick}
                disabled={
                  expiration?.toString() < Date.now().toString() ||
                  remainingTickets?.toNumber() === 0
                }
                className="mt-5 w-full bg-gradient-to-br from-purple-500 to-purple-600 px-10 py-5 rounded-md font-semibold text-white shadow-xl disabled:to-gray-600 disabled:from-gray-600 disabled:text-gray-100 disabled:cursor-not-allowed"
              >
                Buy {quantity} Ticket(s) for{" "}
                {ticketPrice &&
                  Number(ethers.utils.formatEther(ticketPrice?.toString())) *
                    quantity}{" "}
                {currency}
              </button>
            </div>

            {userTickets > 0 && (
              <div className="stats">
                <p className="text-lg mb-2">
                  You have {userTickets} Tickets in this draw
                </p>

                <div className="flex max-w-sm flex-wrap gap-x-2 gap-y-2">
                  {Array(userTickets)
                    .fill("")
                    .map((_, index) => (
                      <p
                        key={index}
                        className=" text-gray-300 h-20 w-12 rounded-lg flex flex-shrink-0 items-center justify-center bg-gray-500/30 text-xs italic"
                      >
                        {index + 1}
                      </p>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
