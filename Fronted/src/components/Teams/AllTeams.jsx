import React, { useEffect, useState } from 'react';

const AllTeams = () => {
    const [teams, setTeams] = useState([]);
    const [expandedTeamIndex, setExpandedTeamIndex] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetch(`${apiUrl}/api/team`)
            .then((response) => response.json())
            .then((data) => {
                setTeams(data.teams || []);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching teams:", error);
                setIsLoading(false);
            });
    }, []);

    const toggleTeamDetails = (index) => {
        setExpandedTeamIndex(prev => prev === index ? null : index);
    };

    const groupPlayersByStyle = (players) => {
        const grouped = {
            Batsman: [],
            Bowler: [],
            "All-Rounder": [],
        };

        players?.forEach(player => {
            const style = player.playerStyle;
            if (grouped[style]) {
                grouped[style].push(player);
            } else {
                if (!grouped["Others"]) grouped["Others"] = [];
                grouped["Others"].push(player);
            }
        });

        return grouped;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-lg font-medium text-gray-700">Loading teams...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        Teams
                    </span>
                </h1>
                {/* <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    Browse through all teams and their talented players in our league
                </p> */}
            </div>

            {/* Teams Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {teams.map((team, index) => (
                    <div 
                        key={index}
                        className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90"></div>
                        <div className="relative z-10 p-6 h-full flex flex-col">
                            <span className="self-start px-3 py-1 bg-white bg-opacity-20  text-xs font-semibold rounded-full mb-4">
                                Team {index + 1}
                            </span>
                            
                            <div className="flex-grow">
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    {team.ownerId?.teamName || team.teamName || "New Team"}
                                </h2>
                                <p className="text-indigo-100 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    {team.ownerName}
                                </p>
                            </div>

                            <button
                                onClick={() => toggleTeamDetails(index)}
                                className="mt-6 w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 transition duration-200"
                            >
                                {expandedTeamIndex === index ? "Hide Details" : "View Team"}
                                <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Team Details Modal */}
            {expandedTeamIndex !== null && teams[expandedTeamIndex] && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div 
                            className="fixed inset-0 transition-opacity" 
                            onClick={() => setExpandedTeamIndex(null)}
                        >
                            <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
                        </div>

                        {/* Modal content */}
                        <div className="inline-block align-bottom bg-white rounded-t-3xl rounded-b-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-bold text-white">
                                        {teams[expandedTeamIndex].teamName || "Team Details"}
                                    </h3>
                                    <button
                                        onClick={() => setExpandedTeamIndex(null)}
                                        className="text-white hover:text-indigo-200 focus:outline-none"
                                    >
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="mt-2 flex items-center text-indigo-100">
                                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    <span>Owner: {teams[expandedTeamIndex].ownerName}</span>
                                </div>
                            </div>

                            <div className="bg-white px-6 py-8">
                                {teams[expandedTeamIndex].players?.length > 0 ? (
                                    <div className="space-y-8">
                                        {Object.entries(groupPlayersByStyle(teams[expandedTeamIndex].players)).map(([category, players]) => (
                                            players.length > 0 && (
                                                <div key={category}>
                                                    <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4 flex items-center">
                                                        <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
                                                            {players.length}
                                                        </span>
                                                        {category}
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {players.map((player, idx) => (
                                                            <div 
                                                                key={idx} 
                                                                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-indigo-50 transition duration-200"
                                                            >
                                                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                                    <svg className="h-5 w-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                                    </svg>
                                                                </div>
                                                                <div className="ml-4 flex-grow">
                                                                    <p className="text-sm font-medium text-gray-900">{player.playerName}</p>
                                                                    <p className="text-xs text-gray-500 capitalize">{player.playerStyle}</p>
                                                                </div>
                                                                <div className="ml-4">
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                        ₹{player.bidAmount}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        <h3 className="mt-2 text-lg font-medium text-gray-900">No players</h3>
                                        <p className="mt-1 text-sm text-gray-500">This team currently has no players assigned.</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-50 px-6 py-4 flex justify-end">
                                <button
                                    onClick={() => setExpandedTeamIndex(null)}
                                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllTeams;