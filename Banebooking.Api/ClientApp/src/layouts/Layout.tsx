import { Outlet, useParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.js';
import BreadcrumbMedSti from '../components/BreadcrumbMedSti.js';

export const SlugContext = React.createContext<string | undefined>(undefined);

export default function Layout() {
    const { slug } = useParams<{ slug: string }>();
    const [laster, setLaster] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLaster(false), 800);
        return () => clearTimeout(timer);
    }, []);

    return (
        <SlugContext.Provider value={slug}>
            <div className="w-full min-h-screen bg-[url('/backgrounds/bg.webp')] bg-cover bg-center bg-fixed">
                <div className="w-full max-w-screen-sm mx-auto px-4 py-4 overflow-x-hidden">
                    <div className="bg-white rounded-md shadow-sm overflow-hidden">
                        <header className="bg-gradient-to-b from-gray-200 to-white border-b border-gray-300 shadow-sm">
                            <Navbar />
                        </header>

                        <BreadcrumbMedSti />

                        <main className="py-1 px-1 min-h-[60vh]">
                            {laster ? (
                                <div className="animate-pulse space-y-4">
                                    <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-20 bg-gray-200 rounded"></div>
                                </div>
                            ) : (
                                <Outlet />
                            )}
                        </main>
                    </div>
                </div>

                <ToastContainer position="bottom-center" autoClose={3000} />
            </div>
        </SlugContext.Provider>
    );
}
