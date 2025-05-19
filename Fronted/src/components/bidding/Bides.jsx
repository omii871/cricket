import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

import io from "socket.io-client";
const Bides = () => {
  
  const [formData, setFormData] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState("All");
  const [biddingPlayers, setBiddingPlayers] = useState([]);
  const [ownerData, setOwnerData] = useState([]);
  const [bids, setBids] = useState({});
  const [ownerBids, setOwnerBids] = useState({});
  const [playerBids, setPlayerBids] = useState({});
  const [timeLeft, setTimeLeft] = useState(10);
  const [recentBidder, setRecentBidder] = useState(null);
  const [initialTimer, setInitialTimer] = useState(12);
  const [initialTimerActive, setInitialTimerActive] = useState(false);
  const [finalBidResult, setFinalBidResult] = useState(null);
  const [biddingActive, setBiddingActive] = useState(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [soldPlayers, setSoldPlayers] = useState([]);
  const [unsoldPlayers, setUnsoldPlayers] = useState([]);

  const playerBidsRef = useRef({});
  const timerRef = useRef(null);
  const timer12Ref = useRef(null);
  const biddingActiveRef = useRef(false);
  const initialTimerActiveRef = useRef(false);
  const biddingPlayersRef = useRef([]);
  const filteredPlayersRef = useRef([]);
  const isHandlingNextPlayerRef = useRef(false);
  const currentPlayerIndexRef = useRef(0);
  const [upcomingPlayer, setUpcomingPlayer] = useState(null);
  
  const apiUrl = import.meta.env.VITE_API_URL;
  const socket = io(apiUrl);

  useEffect(() => {
    biddingActiveRef.current = biddingActive;
  }, [biddingActive]);

  useEffect(() => {
    initialTimerActiveRef.current = initialTimerActive;
  }, [initialTimerActive]);

  useEffect(() => {
    biddingPlayersRef.current = biddingPlayers;
  }, [biddingPlayers]);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/formData`);
        setFormData(response.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchFormData();
  }, []);

  useEffect(() => {
    if (formData.length > 0 && filteredPlayersRef.current.length === 0) {
      preparePlayerQueue();
    }
  }, [formData]);

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/ownerData`);
        if (res.data && Array.isArray(res.data)) {
          setOwnerData(res.data);
        }
      } catch (err) {
        console.error("Error fetching owner data:", err);
      }
    };

    fetchOwnerData();
  }, []);


  const handleOwnerBid = (owner, playerId, amount) => {
    if (!amount || isNaN(amount)) {
      toast.error("Please enter a valid bid amount.");
      return;
    }
    const bidAmount = parseFloat(amount);
    const currentBids = playerBids[playerId] || [];
    const currentHighestBid = currentBids.reduce((max, bid) => bid.amount > max ? bid.amount : max, 0);
    if (bidAmount <= currentHighestBid) {
      // toast.warn(`Aapka bid ₹${bidAmount} hai. Yeh pehle ke highest bid ₹${currentHighestBid} se zyada hona chahiye.`);
      toast.warn(`Your bid of ₹${bidAmount} must be higher than the current highest bid of ₹${currentHighestBid}.`);

      return;
    }
    if (owner.points < bidAmount) {
      // toast.error(`${owner.name} ke paas itne points nahi hain.`);
      toast.error(`${owner.name} does not have enough points.`);

      return;
    }

    setBids((prevBids) => ({
      ...prevBids,
      [playerId]: bidAmount
    }));
    setOwnerBids((prev) => ({
      ...prev,
      [playerId]: { ownerName: owner.name, amount: bidAmount }
    }));
    setPlayerBids((prev) => {
      const updated = {
        ...prev,
        [playerId]: [
          ...(prev[playerId] || []),
          { ownerName: owner.name, amount: bidAmount }
        ]
      };
      playerBidsRef.current = updated;
      return updated;
    });
    setRecentBidder({
      ownerName: owner.name,
      amount: bidAmount,
    });

    setTimeout(() => {
      setRecentBidder(null);
    }, 5000);

    if (!biddingActive) {
      toast.warn("Bidding is not active. ");
      return;
    }
    //socket
    socket.emit("new-bid", {
      playerId,
      ownerName: owner.name,
      ownerId: owner._id,
      amount: bidAmount,
    });

    if (timer) clearInterval(timer);
    setInitialTimerActive(false);

  };

  //socket
 useEffect(() => {
  if (ownerData.length === 0) {
    return;
  }

  // Auction Started
  socket.on("auction-started", (player) => {
    setBiddingPlayers([player]);
    biddingPlayersRef.current = [player];
    setBiddingActive(true);
    biddingActiveRef.current = true;
  });

  // Timer Update
  socket.on("timer-update", ({ value, type }) => {
    setTimeLeft(value);
    setInitialTimer(value);
    setInitialTimerActive(type === "initial");
  });

  // Timer Ended
  socket.on("timer-ended", (type) => {
    const player = biddingPlayersRef.current[0];
    if (type === "initial" && player && player._id) {
      finalizeBid(player._id);

      const unsoldPlayer = {
        playerId: player._id,
        playerName: player.name,
        playerStyle: player.playerStyle
      };

      setUnsoldPlayers((prev) => {
        const alreadyExists = prev.some(p => p.playerId === unsoldPlayer.playerId);
        if (alreadyExists) {
          // console.log("⛔ Duplicate unsold player skipped:", unsoldPlayer.playerId);
          return prev;
        }

        const updatedList = [...prev, unsoldPlayer].slice(-2);
        // console.log("✅ Updated Unsold Players:", updatedList);
        return updatedList;
      });

      socket.emit("player-status-updated", {
        ...unsoldPlayer,
        status: "UNSOLD"
      });

      // toast.info(`${player.name} remained UNSOLD.`);

      setBiddingPlayers([]);
      socket.emit("clear-bidding-player");
    } else if (type === "counter" && player) {
      finalizeBid(player._id);
    }
  });

  // Bid Updated
  socket.on("bid-updated", (data) => {
    setRecentBidder(data);
    setTimeout(() => setRecentBidder(null), 5000);
    setBids((prev) => ({
      ...prev,
      [data.playerId]: data.amount,
    }));

    playerBidsRef.current[data.playerId] = [
      ...(playerBidsRef.current[data.playerId] || []),
      {
        ownerName: data.ownerName,
        ownerId: data.ownerId,
        amount: data.amount,
      },
    ];
  });

  // Auction Ended
  socket.on("auction-ended", (result) => {
    setInitialTimerActive(false);
    setTimeLeft(null);
    setBiddingPlayers([]);
  });

  // Player Status Updated (SOLD or UNSOLD)
  socket.on("player-status-updated", (data) => {
    console.log("Received player-status-updated:", data);

    if (data.status === "SOLD") {
      setSoldPlayers((prev) => {
        const updatedList = [...prev, data].slice(-2);
        console.log("✅ Updated Sold Players:", updatedList);
        return updatedList;
      });
    } else if (data.status === "UNSOLD") {
      setUnsoldPlayers((prev) => {
        const alreadyExists = prev.some(p => p.playerId === data.playerId);
        if (alreadyExists) {
          console.log("⛔ Duplicate unsold player skipped:", data.playerId);
          return prev;
        }

        const updatedList = [...prev, data].slice(-2);
        console.log("✅ Updated Unsold Players:", updatedList);
        return updatedList;
      });
    }
  });

  return () => {
    socket.off("auction-started");
    socket.off("timer-update");
    socket.off("timer-ended");
    socket.off("bid-updated");
    socket.off("auction-ended");
    socket.off("player-status-updated");
  };
}, [ownerData]);



  const finalizeBid = async (playerId) => {
  const bidsForPlayer = playerBidsRef.current[playerId] || [];

  let player = formData?.find((p) => p?._id === playerId);
  if (!player) {
    player = biddingPlayersRef.current?.find((p) => p?._id === playerId);
  }

  if (!player) return;

  // 🟥 UNSOLD Player
  if (bidsForPlayer.length === 0) {
    const unsoldPlayer = {
      playerId: player._id,
      playerName: player.name,
      playerStyle: player.playerStyle
    };

    setUnsoldPlayers((prev) => {
      const alreadyExists = prev.some(p => p.playerId === unsoldPlayer.playerId);
      if (alreadyExists) {
        console.log("⛔ Duplicate unsold player skipped:", unsoldPlayer.playerId);
        return prev;
      }

      const updatedList = [...prev, unsoldPlayer].slice(-2);
      console.log("✅ Updated Unsold Players:", updatedList);
      return updatedList;
    });

    socket.emit("player-status-updated", {
      ...unsoldPlayer,
      status: "UNSOLD"
    });

    toast.info(`${player.name} remained UNSOLD.`);

    setBiddingPlayers([]);
    socket.emit("clear-bidding-player");
    resetBiddingStates();

    await getNextPlayer();
    return;
  }

  // ✅ SOLD Player
  const highestBid = bidsForPlayer.reduce(
    (max, bid) => (bid.amount > max.amount ? bid : max),
    { amount: 0 }
  );

  const winningOwner = ownerData.find((owner) => owner._id === highestBid.ownerId);

  if (!winningOwner) {
    toast.error("Error: Winning owner not found.");
    console.error("Error: Winning owner not found.");
    return;
  }

  const soldPlayer = {
    playerId: player._id,
    playerName: player.name,
    playerStyle: player.playerStyle,
    soldTo: winningOwner.name,
    amount: highestBid.amount
  };

  setSoldPlayers((prev) => {
    const updatedList = [...prev, soldPlayer].slice(-2);
    console.log("✅ Updated Sold Players:", updatedList);
    return updatedList;
  });

  const updatedPoints = winningOwner.points - highestBid.amount;
  setOwnerData((prev) =>
    prev.map((owner) =>
      owner._id === winningOwner._id
        ? { ...owner, points: updatedPoints }
        : owner
    )
  );

  socket.emit("player-status-updated", {
    ...soldPlayer,
    status: "SOLD",
    ownerId: winningOwner._id
  });

  toast.success(`🎉 ${winningOwner.name} has won the bid for ₹${highestBid.amount}!`);

  setBiddingPlayers([]);
  socket.emit("clear-bidding-player");
  resetBiddingStates();

  await getNextPlayer();
};



  const resetBiddingStates = () => {
    setBids({});
    setOwnerBids({});
    setPlayerBids({});
    setInitialTimer(12);
    setInitialTimerActive(false);
  };

  useEffect(() => {
    const addPlayerToTeam = async () => {
      if (!finalBidResult) return;
      try {
        await axios.post(`${apiUrl}/api/team/addPlayer`, finalBidResult);
        toast.success("Player successfully added to the owner's team!");
      } catch (error) {
        console.error("Error adding player to team:", error);
        toast.error("Failed to add player to team.");
      } finally {
        setFinalBidResult(null);
      }
    };
    addPlayerToTeam();
  }, [finalBidResult]);

  const getNextPlayer = async () => {
    if (isHandlingNextPlayerRef.current) return;

    isHandlingNextPlayerRef.current = true;

    try {
      const nextIndex = currentPlayerIndexRef.current + 1;
      const nextPlayer = filteredPlayersRef.current[nextIndex];

      if (nextPlayer) {
        await axios.post(`${apiUrl}/api/biddingPlayer/setBiddingPlayer`, {
          playerId: nextPlayer._id
        });

        setBiddingPlayers([nextPlayer]);
        currentPlayerIndexRef.current = nextIndex;
        setCurrentPlayerIndex(nextIndex);
        resetBiddingStates();

        socket.emit("start-auction", nextPlayer);

        const nextUpcoming = filteredPlayersRef.current[nextIndex + 1];
        if (nextUpcoming) {
          socket.emit("upcoming-player", nextUpcoming);
        }
      } else {
        setBiddingPlayers([]);
        setBiddingActive(false);
        await axios.post(`${apiUrl}/api/biddingPlayer/setBiddingPlayer`, {});
        socket.emit("clear-bidding-player");
      }
    } catch (err) {
      console.error("Error in getNextPlayer:", err);
    } finally {
      isHandlingNextPlayerRef.current = false;
    }
  };



  const handleFilterChange = (style) => {
    setSelectedStyle(style);
    preparePlayerQueue(style);
  };

  const preparePlayerQueue = () => {
    const batsmen = formData.filter((p) => p.playerStyle?.toLowerCase() === "batsman");
    const bowlers = formData.filter((p) => p.playerStyle?.toLowerCase() === "bowler");
    const allrounders = formData.filter((p) => p.playerStyle?.toLowerCase() === "all-rounder");

    const ordered = [...batsmen, ...bowlers, ...allrounders];
    setFilteredPlayers(ordered);
    filteredPlayersRef.current = ordered;
  };

  useEffect(() => {
  const fetchCurrentBiddingPlayer = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/biddingPlayer/getBiddingPlayer`);
      const currentPlayerId = res.data?.playerId;

      if (currentPlayerId && formData.length > 0) {
        const player = formData.find((p) => p._id === currentPlayerId);
        if (player) {
          setBiddingPlayers([player]);
          biddingPlayersRef.current = [player];
        }
      }
    } catch (err) {
      console.error("Error fetching current bidding player:", err);
    }
  };

  if (formData.length > 0) {
    fetchCurrentBiddingPlayer();
  }
}, [formData]);


  return (
  <>
    <div className='flex flex-col lg:flex-row justify-between h-auto lg:h-130 bg-gray-100 p-0 gap-2'>
      {/* players */}
      <div className='bg-gray-200 w-full p-2'>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <h2 className="font-bold text-lg">Player's List</h2>

          <div className="flex flex-wrap gap-2">
            <button
              className='px-3 py-1 bg-gradient-to-r from-red-400 to-green-500 text-white text-sm font-semibold rounded-full shadow hover:from-green-500 hover:to-green-600 hover:scale-105 transition-all duration-300'
              onClick={async () => {
                preparePlayerQueue();
                if (filteredPlayersRef.current.length > 0) {
                  const currentPlayer = filteredPlayersRef.current[0];
                  setCurrentPlayerIndex(0);
                  try {
                    await axios.post(`${apiUrl}/api/biddingPlayer/setBiddingPlayer`, {
                      playerId: currentPlayer._id,
                    });
                    socket.emit("start-auction", currentPlayer);
                    const upcoming = filteredPlayersRef.current[1];
                    if (upcoming) {
                      socket.emit("upcoming-player", upcoming);
                    }
                    const res = await axios.get(`${apiUrl}/api/biddingPlayer/getBiddingPlayer`);
                    if (res.data && res.data.playerId) {
                      setBiddingPlayers([res.data.playerId]);
                      setBiddingActive(false);
                      biddingActiveRef.current = false;
                      setInitialTimer(12);
                      setInitialTimerActive(true);
                    }
                  } catch (err) {
                    console.error("Error setting bidding player:", err);
                  }
                }
              }}
            >
              🚀 Start
            </button>

            <button
              className="px-3 py-1 bg-gradient-to-r from-red-400 to-pink-500 text-white text-sm font-semibold rounded-full shadow hover:from-red-500 hover:to-pink-600 hover:scale-105 transition-all duration-300"
              onClick={() => {
                setBiddingActive(false);
                clearInterval(timer);
              }}
            >
              🛑 Stop
            </button>
            <select
              className="text-sm px-2 py-1 rounded-full bg-green-100 border border-green-300"
              value={selectedStyle}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Batsman">Batsman</option>
              <option value="Bowler">Bowler</option>
              <option value="All-Rounder">All-Rounder</option>
            </select>
          </div>
        </div>

        {/* Players */}
        <div className='h-96 lg:h-120 overflow-y-auto p-1 rounded-2xl shadow-md transition-transform duration-1000 ease-in-out hover:scale-102'>
          {filteredPlayers.length > 0 ? (
            <ul className="space-y-2">
              {filteredPlayers
                .filter((player) => !biddingPlayers.find((bp) => bp._id === player._id))
                .map((player) => (
                  <li key={player._id} className="p-2 border-2 border-amber-100 rounded-lg bg-white shadow-lg flex flex-col sm:flex-row items-center gap-4">
                    <img
                      src={player.fileUrl}
                      alt={player.name}
                      className="w-16 h-16 sm:w-26 sm:h-26 rounded-full object-center border-5 border-blue-100"
                    />
                    <div className="text-center sm:text-left">
                      <div className="font-semibold text-gray-800">Name: {player.name}</div>
                      <div className='font-semibold'>Age: {player.age}</div>
                      <div className='font-semibold'>
                        Player Style: {player.playerStyle || "Not Specified"}
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-gray-500">No players available</p>
          )}
        </div>
      </div>

      {/* Bidding Players */}
      <div className="w-full">
        <div className="max-w-4xl mx-auto bg-gray-200 p-1 h-auto lg:h-130">
          <h2 className="font-serif text-xl lg:text-2xl font-semibold text-center text-gray-700 mb-1">
            Bidding Player
          </h2>
          <h2 className="font-bold text-center mb-1">
            🔁 Current Category: {biddingPlayers[0]?.playerStyle || "Waiting..."}
          </h2>

          {biddingPlayers.length > 0 ? (
            <ul className="space-y-0 rounded-2xl bg-white shadow-xl transition-transform duration-1000 ease-in-out hover:scale-101">
              {biddingPlayers.map((player) => (
                <li
                  key={player._id}
                  className="p-2 border rounded-2xl shadow-md bg-gray-50 space-y-1"
                >
                  <div className="flex flex-col items-center gap-4">
                    <img
                      src={player.fileUrl}
                      alt={player.name}
                      className="w-full sm:w-80 h-auto sm:h-70 object-contain rounded-2xl border-2 border-gray-300 shadow-md"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 text-gray-800 w-full">
                      <div><strong>Name:</strong> {player.name}</div>
                      <div><strong>Age:</strong> {player.age}</div>
                      <div><strong>Player Style:</strong> {player.playerStyle || "Not Specified"}</div>
                      <div className="flex items-center">
                        <strong>Bid Prize:</strong> &nbsp;
                        <input
                          type="text"
                          placeholder="₹0"
                          className="w-20 text-center border-2 border-blue-500 rounded-lg text-gray-800"
                          value={bids[player._id] || ""}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                  {!initialTimerActive && biddingPlayers.length > 0 && (
                    <div className="flex justify-center">
                      <div className="text-lg font-semibold text-red-600 bg-yellow-100 px-6 py-1 rounded-full shadow">
                        ⏱️ Timer: {timeLeft} sec
                      </div>
                    </div>
                  )}

                  <div className="h-10 flex flex-col sm:flex-row justify-center items-center gap-2 transition-all duration-300">
                    {recentBidder && (
                      <div className="text-sm sm:text-md font-medium text-blue-800 bg-blue-100 px-2 sm:px-4 rounded-full shadow">
                        🗣️ {recentBidder.ownerName} placed a bid of ₹{recentBidder.amount}
                      </div>
                    )}

                    {initialTimerActive && (
                      <div className="text-sm sm:text-md font-semibold text-green-700 bg-green-100 px-2 sm:px-4 py-1 rounded-full shadow">
                        ⏳ Bidding Starting : {initialTimer} sec
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center justify-center h-full py-8">
              <p className="text-gray-500 text-lg">No Player Added to Bidding</p>
            </div>
          )}
        </div>
      </div>

      {/* Sold & Unsold Players */}
      <div className="bg-gray-200 w-full rounded-lg p-2 sm:p-4 h-auto lg:h-130">
        <h3 className="text-center font-serif font-bold text-xl sm:text-2xl mb-3">Sold & Unsold Players</h3>

        <div className="flex flex-col gap-4 h-full">
          {/* 📦 Sold Players */}
          <div className="bg-green-50 rounded-md p-2 shadow overflow-y-auto h-30 flex-1">
            <h3 className="text-lg sm:text-xl font-bold mb-2 text-green-800 text-center">📦 Sold Players</h3>
            <ul className="space-y-2">
              {soldPlayers.length > 0 ? (
                soldPlayers.map((player) => (
                  <li key={player.playerId} className="p-2 border rounded-md bg-green-100 text-xs sm:text-sm">
                    ✅ {player.playerName} - {player.playerStyle} (₹{player.amount} by {player.soldTo})
                  </li>
                ))
              ) : (
                <p className="text-center text-gray-600">No players sold yet.</p>
              )}
            </ul>
          </div>

          {/* 🚫 Unsold Players */}
          <div className="bg-red-50 rounded-md p-2 shadow overflow-y-auto h-30 flex-1">
            <h3 className="text-lg sm:text-xl font-bold mb-2 text-red-800 text-center">🚫 Unsold Players</h3>
            <ul className="space-y-2">
              {unsoldPlayers.length > 0 ? (
                unsoldPlayers.map((player) => (
                  <li key={player.playerId} className="p-2 border rounded-md bg-red-100 text-xs sm:text-sm">
                    ❌ {player.playerName} - {player.playerStyle}
                  </li>
                ))
              ) : (
                <p className="text-center text-gray-600">No unsold players at the moment.</p>
              )}
            </ul>
          </div>

          {/* 🔜 Upcoming Player */}
          <div className="bg-yellow-50 rounded-md p-2 shadow overflow-y-auto flex-1">
            <h3 className="text-lg sm:text-xl font-bold mb-2 text-yellow-700 text-center">🔜 Upcoming Player</h3>
            {(() => {
              const currentIndex = filteredPlayers.findIndex(p => p._id === biddingPlayers[0]?._id);
              const upcomingPlayer = filteredPlayers[currentIndex + 1];

              return upcomingPlayer ? (
                <div className="p-2 sm:p-3 border rounded-md bg-yellow-100 shadow-md">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
                    <img
                      src={upcomingPlayer.fileUrl}
                      alt="Upcoming Player"
                      className="w-16 h-16 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-yellow-300"
                    />
                    <div className="text-center sm:text-left">
                      <div><strong>Name:</strong> {upcomingPlayer.name}</div>
                      <div><strong>Age:</strong> {upcomingPlayer.age}</div>
                      <div><strong>Player Style:</strong> {upcomingPlayer.playerStyle}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-600 mt-2">🎉 All player auctions are complete.</p>
              );
            })()}
          </div>
        </div>
      </div>
    </div>

    {/* Owners */}
    <div className="p-2 sm:p-4 font-bold">
      <h2 className="text-center text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">Owner</h2>
      {
        ownerData.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {ownerData.map((owner, index) => (
              <li
                key={index}
                className="p-2 sm:p-3 shadow-lg rounded-full flex items-center gap-x-2 bg-blue-100 transition-transform duration-1000 ease-in-out hover:scale-103"
              >
                <img
                  src={owner.fileUrl}
                  alt={owner.name}
                  className="w-16 h-16 sm:w-22 sm:h-24 rounded-full object-cover border-4 border-amber-400 shadow-lg"
                />
                <div className="flex flex-col text-sm sm:text-base">
                  <div><span className='font-semibold'>Name:</span> {owner.name}</div>
                  <div><span className='font-semibold'>Team:</span> {owner.teamName}</div>
                  <div><span className='font-semibold'>Point:</span>{owner.points}₹</div>
                  <div className="flex items-center">
                    <input
                      type="text"
                      placeholder="₹0.00"
                      className="w-16 sm:w-20 px-2 sm:px-4 py-1 border border-gray-300 rounded-s-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => setOwnerBids((prev) => ({
                        ...prev,
                        [owner._id]: e.target.value
                      }))}
                      value={ownerBids[owner._id] || ""}
                    />
                    <button
                      onClick={() => handleOwnerBid(owner, biddingPlayers[0]?._id, ownerBids[owner._id])}
                      className="w-8 sm:w-10 py-1 bg-blue-500 text-white rounded-e-lg hover:bg-blue-700 transition">
                      Send
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-700">No Owners Available</p>
        )
      }
    </div>
    <ToastContainer position='top-center' autoClose={3000} />
  </>
);

  
}
export default Bides;