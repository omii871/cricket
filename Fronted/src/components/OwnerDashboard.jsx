import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import io from "socket.io-client";

const OwnerDashboard = () => {
  const [formData, setFormData] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [biddingPlayers, setBiddingPlayers] = useState([]);
  const [ownerData, setOwnerData] = useState([]);
  const [bids, setBids] = useState({});
  const [ownerBids, setOwnerBids] = useState({});
  const [playerBids, setPlayerBids] = useState({});
  const [timer, setTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [recentBidder, setRecentBidder] = useState(null);
  const [initialTimer, setInitialTimer] = useState(12);
  const [initialTimerActive, setInitialTimerActive] = useState(false);
  const playerBidsRef = useRef({});
  const [finalBidResult, setFinalBidResult] = useState(null);
  const [biddingActive, setBiddingActive] = useState(false);
  const [soldPlayers, setSoldPlayers] = useState([]);
  const [unsoldPlayers, setUnsoldPlayers] = useState([]);
  const [upcomingPlayer, setUpcomingPlayer] = useState(null);
  const [myTeam, setMyTeam] = useState([]);
  const [currentOwner, setCurrentOwner] = useState(null);
  const [highestBids, setHighestBids] = useState({});
  
  const apiUrl = import.meta.env.VITE_API_URL;
  
  const socket = io(apiUrl);
  const biddingPlayersRef = useRef([]);
  const biddingActiveRef = useRef(false);
  const timerRef = useRef(null);
  const isFirstRender = useRef(true);
  
  const ownerId = localStorage.getItem('ownerId');
  const loggedInOwner = ownerData.find(owner => owner._id === ownerId);
  const otherOwners = ownerData.filter(owner => owner._id !== ownerId);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/formData`);
        setFormData(response.data);
        setFilteredPlayers(response.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchFormData();
  }, []);

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/ownerData`);
        if (!Array.isArray(res.data)) {
          console.error("Expected an array but got:", res.data);
          return;
        }

        const currentOwnerId = sessionStorage.getItem("ownerId");
        const owner = res.data.find((o) => o._id === currentOwnerId);

        if (owner) {
          setCurrentOwner(owner);
          setOwnerData(res.data);
        } else {
          console.warn("Owner not found in response data.");
        }
      } catch (err) {
        console.error("Error fetching owner data:", err);
      }
    };

    fetchOwnerData();
  }, []);
  
  const getNextPlayer = () => {
    socket.emit("get-next-player");
  };
  useEffect(() => {
    socket.on("auction-started", (player) => {
      setBiddingPlayers([player]);
      biddingPlayersRef.current = [player];
      setBiddingActive(true);
      biddingActiveRef.current = true;
    });

    socket.on("timer-update", ({ value, type }) => {
      setTimeLeft(value);
      setInitialTimer(value);
      setInitialTimerActive(type === "initial");
    });

    socket.on("timer-ended", (type) => {
      if (type === "initial") {
        const player = biddingPlayersRef.current[0];
        if (player && player._id) {
          // toast.info(`${player.name} UNSOLD ho gaya.`);
          // setUnsoldPlayers((prev) => [...prev, player]);
          setBiddingPlayers([]);
          finalizeBid(player._id)
          socket.emit("clear-bidding-player");
          getNextPlayer();
        }
      } else if (type === "counter") {
        const player = biddingPlayersRef.current[0];
        if (player) {
          if (ownerData.length > 0) {
            finalizeBid(player._id);
          } else {
            console.warn(" finalizeBid skipped — ownerData not ready yet");
          }
        }
      }
    });

    socket.on("bid-updated", (data) => {
      setRecentBidder(data);
      setTimeout(() => setRecentBidder(null), 5000);

      setBids((prev) => ({
        ...prev,
        [data.playerId]: data.amount,
      }));

      setHighestBids((prev) => ({
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

    socket.on("auction-ended", (result) => {
      setInitialTimerActive(false);
      setTimeLeft(null);
      setBiddingPlayers([]);

      if (result?.status === "SOLD") {

        // toast.success(`🎉 ${result.ownerName} bought ${result.playerName} for ₹${result.amount}`);
        toast.success(`🎉 ${result.ownerName} has bought ${result.playerName} for ₹${result.amount}!`);

      } else if (result?.status === "UNSOLD") {
        // toast.info(`❌ ${result.playerName} UNSOLD ho gaya.`);
      }
    });

    socket.on("clear-bidding-player", () => {
      setBiddingPlayers([]);
    });

    socket.on("show-upcoming-player", (player) => {
      setUpcomingPlayer(player);
    });

    socket.on("get-next-player", () => {
      getNextPlayer();
    });
    return () => {
      socket.off("auction-started");
      socket.off("timer-update");
      socket.off("timer-ended");
      socket.off("bid-updated");
      socket.off("auction-ended");
      socket.off("clear-bidding-player");
      socket.off("show-upcoming-player");
      socket.off("get-next-player");

    };
  }, [ownerData]);

  const handleOwnerBid = (owner, playerId, amount) => {
    if (!amount || isNaN(amount)) {
      // toast.error("Kripya ek sahi bid amount daalein.");
      toast.error("Please enter a valid bid amount.");

      return;
    }
    const bidAmount = parseFloat(amount);
    const currentBids = playerBids[playerId] || [];

    const currentHighestBid = highestBids[playerId] || 0;
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
          { ownerName: owner.name, amount: bidAmount, ownerId: owner._id }
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

    socket.emit("new-bid", {
      playerId,
      ownerName: owner.name,
      ownerId: owner._id,
      amount: bidAmount,
    });

    if (timer) clearInterval(timer);
    setInitialTimerActive(false);

  };

  const finalizeBid = (playerId) => {
    const bidsForPlayer = playerBidsRef.current[playerId] || [];
    const player = filteredPlayers.find(p => p._id === playerId);

    if (!player) {
      console.warn("Player not found");
      return;
    }

    const highestBid = bidsForPlayer.reduce(
      (max, bid) => bid.amount > max.amount ? bid : max,
      { amount: 0 }
    );

    // === 🚫 UNSOLD PATH ===
    if (highestBid.amount === 0) {
      setUnsoldPlayers(prev => {
        const alreadyExists = prev.find(p => p._id === playerId);
        if (alreadyExists) return prev;

        const updatedList = [...prev, player].slice(-2); // ✅ Only last 2 players
        console.log("Updated Unsold Players:", updatedList);
        return updatedList;

      });

      // toast.info(`${player.name} UNSOLD ho gaya. Kisi ne valid bid nahi kiya.`);
      toast.info(`${player.name} remained UNSOLD. No valid bid was placed.`);


      socket.emit("player-status-updated", {
        playerId: playerId,
        status: "UNSOLD",
        playerName: player.name,
        playerStyle: player.playerStyle
      });

      socket.emit("auction-ended", {
        playerId: playerId,
        status: "UNSOLD",
        playerName: player.name,
        playerStyle: player.playerStyle
      });

      setBiddingPlayers([]);
      resetBiddingStates();
      return;
    }

    // === ✅ SOLD PATH ===
    const winningOwner = ownerData.find(owner => owner._id === highestBid.ownerId);
    if (!winningOwner) {
      toast.error("Winning owner not found.");
      return;
    }

    setSoldPlayers(prev => {
      const alreadyExists = prev.find(p => p._id === playerId);
      if (alreadyExists) return prev;

      const newList = [...prev, { ...player, ownerName: winningOwner.name }];
      return newList.slice(-2); // ✅ Only last 2 sold players
    });

    const updatedPoints = winningOwner.points - highestBid.amount;
    const updatedOwners = ownerData.map(owner =>
      owner._id === winningOwner._id ? { ...owner, points: updatedPoints } : owner
    );
    setOwnerData(updatedOwners);

    socket.emit("update-owner-points", {
      ownerId: winningOwner._id,
      newPoints: updatedPoints
    });

    setFinalBidResult({
      ownerId: winningOwner._id,
      ownerName: winningOwner.name,
      playerId: player._id,
      playerName: player.name,
      bidAmount: highestBid.amount,
      playerStyle: player.playerStyle,
    });

    socket.emit("player-status-updated", {
      playerId: player._id,
      status: "SOLD",
      playerName: player.name,
      playerStyle: player.playerStyle,
      // soldTo: highestBid.ownerName,
      soldTo: winningOwner.name,

      amount: highestBid.amount,
      ownerId: winningOwner._id
    });

    // toast.success(`🎉 ${highestBid.ownerName} bought ${player.name} for ₹${highestBid.amount}`);
    toast.success(`🎉 ${highestBid.ownerName} has bought ${player.name} for ₹${highestBid.amount}!`);

    socket.emit("auction-ended", {
      ownerId: winningOwner._id,
      ownerName: winningOwner.name,
      playerId: player._id,
      playerName: player.name,
      bidAmount: highestBid.amount,
    });

    setBiddingPlayers([]);
    resetBiddingStates();
  };


  const resetBiddingStates = () => {
    setBids({});
    setOwnerBids({});
    setPlayerBids({});
    setInitialTimer(12);
    setInitialTimerActive(false);
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const addPlayerToTeam = async () => {
      if (!finalBidResult) return;
      if (!finalBidResult.playerStyle) {
        finalBidResult.playerStyle = 'Batsman';
      }
      try {
        await axios.post(`${apiUrl}/api/team/addPlayer`, finalBidResult);
        toast.success("Player successfully added to the owner's team!");
      } catch (error) {
        console.error(" Error adding player to team:", error);
        toast.error("Failed to add player to team.");
      } finally {
        setFinalBidResult(null);
      }
    };

    addPlayerToTeam();
  }, [finalBidResult]);


  useEffect(() => {
  socket.on("owner-points-updated", ({ ownerId: updatedOwnerId, newPoints }) => {
    // Check if update is for this owner
    if (currentOwner && updatedOwnerId === currentOwner._id) {
      setCurrentOwner((prev) => ({
        ...prev,
        points: newPoints
      }));
    }
  });

  return () => {
    socket.off("owner-points-updated");
  };
}, [currentOwner]);


  useEffect(() => {
  }, [upcomingPlayer]);

  useEffect(() => {
    const fetchBiddingPlayer = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/biddingPlayer/getBiddingPlayer`);
        if (res.data && res.data.playerId) {
          setBiddingPlayers([res.data.playerId]);
          setBiddingActive(true);
          setInitialTimer(12);
          setInitialTimerActive(true);
        } else {
          setBiddingPlayers([]);
        }
      } catch (error) {
        console.error("Error fetching bidding player:", error);
      }
    };
    fetchBiddingPlayer();
  }, []);

  useEffect(() => {
    const fetchUpcomingInitially = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/formData`);
        setFilteredPlayers(res.data);
        if (res.data.length > 1) {
          setUpcomingPlayer(res.data[0]);
        }
      } catch (err) {
        console.error("Error fetching initial upcoming player:", err);
      }
    };

    fetchUpcomingInitially();
  }, []);

  useEffect(() => {
  socket.on("player-added-to-team", ({ ownerId: updatedOwnerId, player }) => {
    if (currentOwner && updatedOwnerId === currentOwner._id) {
      setMyTeam(prev => [...prev, player]);
    }
  });

  return () => {
    socket.off("player-added-to-team");
  };
}, [currentOwner]);

  useEffect(() => {
    socket.on("initial-timer-tick", (time) => {
      setInitialTimer(time);
    });

    socket.on("start-initial-timer", (startTime) => {
      setInitialTimer(startTime);
      setInitialTimerActive(true);
    });

    socket.on("initial-timer-end", () => {
      setInitialTimerActive(false);
      setInitialTimer(0);
      setBiddingTimer(10);
      setBiddingTimerActive(true);
    });

    return () => {
      socket.off("initial-timer-tick");
      socket.off("start-initial-timer");
      socket.off("initial-timer-end");
    };
  }, []);


  useEffect(() => {
    const fetchMyTeam = async () => {
      try {
        const currentOwnerId = sessionStorage.getItem("ownerId");
        if (!currentOwnerId) {
          console.warn("No ownerId found in sessionStorage.");
          return;
        }

        const res = await axios.get(`${apiUrl}/api/team/${currentOwnerId}`);

        if (!res.data || !Array.isArray(res.data.players)) {
          console.error("Unexpected response for team data:", res.data);
          return;
        }

        setMyTeam(res.data.players);
      } catch (error) {
        console.error("Error fetching team data:", error);
      }
    };

    fetchMyTeam();
  }, []);


  const batsmen = myTeam.filter(player => player.playerStyle === "Batsman");
  const bowlers = myTeam.filter(player => player.playerStyle === "Bowler");
  const allRounders = myTeam.filter(player => player.playerStyle === "All-Rounder");

  return (
  <>
    <div className='flex flex-col lg:flex-row justify-between gap-2 p-1'>
      {/* Bidding Players */}
      <div className="w-full lg:w-2/3">
        <div className="max-w-4xl mx-auto bg-gray-200 p-1 h-[32.5rem]">
          <h2 className="font-serif text-2xl font-semibold text-center text-gray-700 mb-1">
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
                      className="w-40 md:w-80 h-40 md:h-70 object-contain rounded-2xl border-2 border-gray-300 shadow-md"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-gray-800 w-full text-center">
                      <div><strong>Name:</strong> {player.name}</div>
                      <div><strong>Age:</strong> {player.age}</div>
                      <div><strong>Player Style:</strong> {player.playerStyle || "Not Specified"}</div>
                      <div className="">
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

                  <div className="h-10 flex justify-center items-center transition-all duration-300">
                    {recentBidder && (
                      <div className="text-sm md:text-md font-medium text-blue-800 bg-blue-100 px-2 md:px-4 rounded-full shadow">
                        🗣️ {recentBidder.ownerName} placed a bid of ₹{recentBidder.amount}
                      </div>
                    )}
                    {initialTimerActive && (
                      <div className="text-sm md:text-md font-semibold text-green-700 bg-green-100 px-2 md:px-4 py-1 rounded-full shadow ml-2 md:ml-4">
                        ⏳ Bidding Starting : {initialTimer} sec
                      </div>
                    )}
                  </div>

                  {!initialTimerActive && timeLeft > 0 && (
                    <div className="flex justify-center">
                      <div className="text-md font-semibold text-red-600 bg-yellow-100 px-4 py-1 rounded-full shadow">
                        ⏱️ Timer: {timeLeft} sec
                      </div>
                    </div>
                  )}
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

      {/* Right Sidebar - Sold, Unsold, Upcoming */}
      <div className="w-full lg:w-1/3 flex flex-col gap-1 bg-gray-200 p-2 h-[32.5rem]">
        {/* Sold Players */}
        <div className="bg-green-50 rounded-md p-2 shadow overflow-y-auto flex-1">
          <h3 className="text-xl font-bold mb-2 text-green-800 text-center">📦 Sold Players</h3>
          {soldPlayers.length > 0 ? (
            <ul className="space-y-2">
              {soldPlayers.map(player =>
                player ? (
                  <li key={player._id} className="p-2 border rounded-md bg-green-100 text-sm">
                    ✅ {player.name} - {player.playerStyle}
                    🧑‍💼 <span className="font-semibold">Owner:</span> {player.ownerName}
                  </li>
                ) : null
              )}
            </ul>
          ) : (
            <p className="text-center text-gray-600">No players sold yet.</p>
          )}
        </div>

        {/* Unsold Players */}
        <div className="bg-red-50 rounded-md p-2 shadow overflow-y-auto flex-1">
          <h3 className="text-xl font-bold mb-1 text-red-800 text-center">🚫 Unsold Players</h3>
          {unsoldPlayers.length > 0 ? (
            <ul className="space-y-2">
              {unsoldPlayers.map(player =>
                player ? (
                  <li key={player._id} className="p-2 border rounded-md bg-red-100 text-sm">
                    ❌ {player.name} - {player.playerStyle}
                  </li>
                ) : null
              )}
            </ul>
          ) : (
            <p className="text-center text-gray-600">No unsold players at the moment.</p>
          )}
        </div>

        {/* Upcoming Player */}
        <div className="bg-yellow-50 rounded-md p-2 shadow overflow-y-auto flex-1">
          <h3 className="text-xl font-bold mb-1 text-yellow-700 text-center">🔜 Upcoming Player</h3>
          {upcomingPlayer ? (
            <div className="p-1 border rounded-md bg-yellow-100 shadow-sm">
              <div className="flex flex-row items-center gap-2">
                <img
                  src={upcomingPlayer.fileUrl}
                  alt="Upcoming Player"
                  className="w-20 h-20 md:w-26 md:h-26 rounded-lg object-cover border-2 border-yellow-300"
                />
                <div className="text-sm">
                  <p><strong>Name:</strong> {upcomingPlayer.name}</p>
                  <p><strong>Age:</strong> {upcomingPlayer.age}</p>
                  <p><strong>Style:</strong> {upcomingPlayer.playerStyle}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-600">Sabhi players ka auction complete ho chuka hai.</p>
          )}
        </div>
      </div>
    </div>

    {/* Bottom Section - Owners and Categories */}
    <div className='flex flex-col lg:flex-row justify-between gap-2 mt-2'>

      {/* Logged in Owner */}
      <div className="w-full lg:w-1/4 p-2 md:p-4 bg-blue-100 rounded-2xl shadow-xl">
        <h2 className="text-center text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-4">You</h2>
        {currentOwner ? (
          <div className="flex flex-col items-center text-center space-y-2 md:space-y-4">
            <img
              src={currentOwner.fileUrl}
              alt={currentOwner.name}
              className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-yellow-400 shadow-md object-cover"
            />
            <div className="space-y-1 text-sm md:text-base text-gray-700">
              <p><span className="font-semibold">Name:</span> {currentOwner.name}</p>
              <p><span className="font-semibold">Team:</span> {currentOwner.teamName}</p>
              <p><span className="font-semibold">Points:</span> ₹{currentOwner.points}</p>
            </div>

            <div className="flex w-full">
              <input
                type="text"
                placeholder="₹0.00"
                className="flex-1 px-2 md:px-4 py-1 text-sm md:text-base border border-gray-300 rounded-l-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) =>
                  setOwnerBids((prev) => ({
                    ...prev,
                    [currentOwner._id]: e.target.value,
                  }))
                }
                value={ownerBids[currentOwner._id] || ""}
              />
              <button
                onClick={() =>
                  handleOwnerBid(
                    currentOwner,
                    biddingPlayers[0]?._id,
                    ownerBids[currentOwner._id]
                  )
                }
                className="px-2 md:px-4 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition text-sm md:text-base"
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-red-500">Logged-in owner not found</p>
        )}
      </div>

      {/* Categories (Batsman, Bowler, All-Rounder) */}
      <div className="w-full lg:w-2/4 flex flex-col sm:flex-row justify-between gap-2">
        {/* Batsman Section */}
        <div className="w-full sm:w-1/3 bg-blue-100 rounded-lg shadow-md p-2 md:p-4">
          <h2 className="text-xl md:text-2xl font-bold text-center text-blue-800 mb-2 md:mb-3">Batsman</h2>
          <ul className="space-y-1.5 h-60 md:h-80 pr-1 overflow-y-auto">
            {batsmen.length > 0 ? (
              batsmen.map((player, index) => (
                <li key={index} className="bg-white p-1 md:p-2 rounded-md shadow text-sm md:text-base text-gray-800">
                  {player.playerName} - ₹{player.bidAmount}
                </li>
              ))
            ) : (
              <p className="text-center text-gray-500">No Batsman added</p>
            )}
          </ul>
        </div>

        {/* Bowler Section */}
        <div className="w-full sm:w-1/3 bg-blue-100 rounded-lg shadow-md p-2 md:p-4">
          <h2 className="text-xl md:text-2xl font-bold text-center text-blue-800 mb-2 md:mb-3">Bowler</h2>
          <ul className="space-y-1.5 h-60 md:h-80 pr-1 overflow-y-auto">
            {bowlers.length > 0 ? (
              bowlers.map((player, index) => (
                <li key={index} className="bg-white p-1 md:p-2 rounded-md shadow text-sm md:text-base text-gray-800">
                  {player.playerName} - ₹{player.bidAmount}
                </li>
              ))
            ) : (
              <p className="text-center text-gray-500">No Bowler added</p>
            )}
          </ul>
        </div>

        {/* All-Rounder Section */}
        <div className="w-full sm:w-1/3 bg-blue-100 rounded-lg shadow-md p-2 md:p-4">
          <h2 className="text-xl md:text-2xl font-bold text-center text-blue-800 mb-2 md:mb-3">All-Rounder</h2>
          <ul className="space-y-1.5 h-60 md:h-80 pr-1 overflow-y-auto">
            {allRounders.length > 0 ? (
              allRounders.map((player, index) => (
                <li key={index} className="bg-white p-1 md:p-2 rounded-md shadow text-sm md:text-base text-gray-800">
                  {player.playerName} - ₹{player.bidAmount}
                </li>
              ))
            ) : (
              <p className="text-center text-gray-500">No All-Rounder added</p>
            )}
          </ul>
        </div>
      </div>

      {/* Other Owners */}
      <div className="w-full lg:w-1/4 p-2 md:p-4 bg-blue-100 rounded-lg">
        <h2 className="text-lg md:text-xl font-semibold text-center mb-1">All Other Owners</h2>
        <div className="h-60 md:h-85 pr-1 overflow-y-auto space-y-2">
          {otherOwners.map((owner, index) => (
            <div key={index} className="p-1 md:p-2 bg-white rounded-md shadow-md flex items-center gap-2">
              <img
                src={owner.fileUrl}
                alt={owner.name}
                className="w-10 h-10 md:w-14 md:h-14 rounded-full object-cover border-2 border-blue-300"
              />
              <div className="text-xs md:text-sm">
                <div className="font-semibold">{owner.name}</div>
                <div className="text-gray-600"><strong>Team: </strong>{owner.teamName}</div>
                <div className="text-gray-700"><strong>Points: ₹</strong>{owner.points}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <ToastContainer position='top-center' autoClose={3000} />
  </>
);
  
}
export default OwnerDashboard;