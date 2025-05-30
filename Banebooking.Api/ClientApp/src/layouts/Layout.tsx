import { Outlet, useParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React from 'react';
import Navbar from '../components/Navbar.js';
import BreadcrumbMedSti from '../components/BreadcrumbMedSti.js';

export const SlugContext = React.createContext<string | undefined>(undefined);

export default function Layout() {
    const { slug } = useParams<{ slug: string }>();

    return (
        <SlugContext.Provider value={slug}>
            <div className="w-full">
                {/* Felles wrapper for innhold */}
                <div className="w-full max-w-screen-sm mx-auto px-1">
                    <header className="border-b bg-white">
                        <Navbar />
                    </header>

                    <BreadcrumbMedSti />

                    <main className="py-2">
                        <Outlet />
                    </main>
                </div>

                <ToastContainer position="bottom-center" autoClose={3000} />
            </div>
        </SlugContext.Provider>
    );
}

