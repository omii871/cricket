import React, { useState } from 'react';
import Form from './Plyer/Form';
import CrudTable from './Plyer/CrudTbale';
import OwnerForm from './Owner/OwnerForm';
import OwnerList from './Owner/OwnerList';
import Bides from './bidding/Bides';
import AllTeams from './Teams/AllTeams';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isPlayerOpen, setIsPlayerOpen] = useState(false);

    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isPlayerListVisible, setIsPlayerListVisible] = useState(false);
    const [isOwnerOpen, setIsOwnerOpen] = useState(false);
    const [isOwnerVisible, setIsOwnerVisible] = useState(false);
    const [isOwnerListVisible, setIsOwnerListVisible] = useState(false);
    const [isBidesVisible, setIsBidesVisible] = useState(false);
    const [isTeamsVisible, setIsTeamsVisible] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleOwnerMenu = () => {
        setIsOwnerOpen(!isOwnerOpen);
    };

    const togglePlayerMenu = () => {
        setIsPlayerOpen(!isPlayerOpen);
    };

    const handlePlayerListClick = () => {
        setIsPlayerListVisible(true);
        setIsFormVisible(false);
        setIsOwnerVisible(false);
        setIsOwnerListVisible(false);
    };

    const handlePlayerRegistrationClick = () => {
        setIsPlayerListVisible(false);
        setIsFormVisible(true);
        setIsOwnerVisible(false);
        setIsOwnerListVisible(false);
    };

    const handleOwnerRegistration = () => {
        setIsOwnerVisible(true);
        setIsPlayerListVisible(false);
        setIsOwnerListVisible(false);
        setIsFormVisible(false);
    };

    const handleOwnerListClick = () => {
        setIsFormVisible(false);
        setIsOwnerVisible(false);
        setIsOwnerListVisible(true);
        setIsPlayerListVisible(false);
    };
    const handleBidesClick = () => {
        setIsFormVisible(false);
        setIsOwnerVisible(false);
        setIsOwnerListVisible(false);
        setIsPlayerListVisible(false);
        setIsBidesVisible(true);
    };
    const handleTeamsClick = () => {
        setIsFormVisible(false);
        setIsOwnerVisible(false);
        setIsOwnerListVisible(false);
        setIsPlayerListVisible(false);
        setIsBidesVisible(false);
        setIsTeamsVisible(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        navigate('/');
    };



    return (
        <div className="overflow-hidden">
            <nav className="w-full bg-gray-100 px-6 shadow-sm h-[60px] fixed ">
                <div className="  flex items-center justify-between h-full">
                    <div onClick={toggleSidebar} className="cursor-pointer text-gray-800">
                        {/* <i className="fa-solid fa-grip-lines text-2xl"></i> */}
                        <i className="fa-solid fa-bars text-2xl"></i>

                    </div>

                    <div className="flex items-center space-x-4">
                        <a href="/" className="flex items-center">
                            <img
                                src="/APL_logo.png"
                                alt="Logo"
                                className="h-[50px] w-auto"
                            />
                        </a>

                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-4xl transition duration-200"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>


            {/* Sidebar start */}

            <div className="flex h-full pt-[60px]">
                <div
                    className={`fixed top-[60px] left-0 w-60 h-full bg-gray-900 text-white transition-all duration-2000 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    <div className="p-4 text-center">
                        <h1 className="text-3xl font-extralight">Sidebar Content</h1>
                        <ul className="mt-5">
                            <li
                                className="bg-amber-50 rounded-2xl mb-4 h-10 flex items-center justify-center transform transition duration-300 hover:bg-blue-50 hover:text-black hover:scale-105 hover:shadow-lg hover:underline"
                                onClick={toggleOwnerMenu}
                            >
                                <a href="#" className="text-black text-xl">
                                    Owner Menu
                                </a>
                            </li>
                            {isOwnerOpen && (
                                <ul className="pl-4">
                                    <li
                                        className="bg-amber-50 rounded w-45 mb-4 h-7 flex items-center justify-center transform transition duration-300 hover:bg-green-100 hover:text-black hover:scale-105 hover:shadow-lg"
                                        onClick={handleOwnerRegistration}
                                    >
                                        <a className="text-black text-xl">Owner Registration</a>
                                    </li>
                                    <li
                                        className="bg-amber-50 rounded w-45 mb-4 h-7 min-w-fit flex items-center justify-center transform transition duration-700 hover:bg-green-100 hover:text-black hover:scale-105 hover:shadow-lg"
                                        onClick={handleOwnerListClick}
                                    >
                                        <a href="#" className="text-black text-xl">
                                            Owner List
                                        </a>
                                    </li>
                                </ul>
                            )}
                            <li
                                className="bg-amber-50 rounded-2xl mb-4 h-10 flex items-center justify-center transform transition duration-300 hover:bg-blue-50 hover:text-black hover:scale-105 hover:shadow-lg hover:underline"
                                onClick={togglePlayerMenu}
                            >
                                <a className="text-black text-xl">
                                    Player
                                </a>
                            </li>

                            {isPlayerOpen && (
                                <ul className="pl-4">
                                    <li
                                        className="bg-amber-50 rounded w-45 mb-4 h-7 flex items-center justify-center transform transition duration-300 hover:bg-green-100 hover:text-black hover:scale-105 hover:shadow-lg"
                                        onClick={handlePlayerRegistrationClick}
                                    >
                                        <a className="text-black text-xl">
                                            Player Registration
                                        </a>
                                    </li>
                                    <li
                                        className="bg-amber-50 rounded w-45 mb-4 h-7 min-w-fit flex items-center justify-center transform transition duration-700 hover:bg-green-100 hover:text-black hover:scale-105 hover:shadow-lg"
                                        onClick={handlePlayerListClick}
                                    >
                                        <a className="text-black text-xl">
                                            Player List
                                        </a>
                                    </li>
                                </ul>
                            )}

                            <li className="bg-amber-50 rounded-2xl mb-4 h-10 flex items-center justify-center transform transition duration-300 hover:bg-blue-50 hover:text-black hover:scale-105 hover:shadow-lg hover:underline"
                                onClick={handleBidesClick}>
                                <a className="text-black text-xl">
                                    Bides
                                </a>
                            </li>
                            <li className="bg-amber-50 rounded-2xl mb-4 h-10 flex items-center justify-center transform transition duration-300 hover:bg-blue-50 hover:text-black hover:scale-105 hover:shadow-lg hover:underline"
                                onClick={handleTeamsClick}>
                                <a className="text-black text-xl">
                                    Teams
                                </a>
                            </li>
                            {/* <li className="bg-amber-50 rounded-2xl mb-4 h-10 flex items-center justify-center transform transition duration-300 hover:bg-blue-50 hover:text-black hover:scale-105 hover:shadow-lg hover:underline"
                            >
                                <a className="text-black text-xl">
                                    ScoreBoard
                                </a>
                            </li> */}
                        </ul>
                    </div>
                </div>

                <div
                    className={`flex-1 transition-all duration-2000 ease-in-out ${isSidebarOpen ? 'ml-60' : 'ml-0'}`}
                >
                    {isFormVisible ? (
                        <Form />
                    ) : isPlayerListVisible ? (
                        <CrudTable />
                    ) : isOwnerVisible ? (
                        <OwnerForm />
                    ) : isOwnerListVisible ? (
                        <OwnerList />
                    ) : isBidesVisible ? (
                        <Bides />
                    ) : isTeamsVisible ? (
                        <AllTeams />
                    ) : (
                        <div>Hello  </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default Home;





