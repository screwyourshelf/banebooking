import { Outlet, useParams } from 'react-router-dom';
import { Toaster } from 'sonner';
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.js';
import BreadcrumbMedSti from '../components/BreadcrumbMedSti.js';
import { Skeleton } from '@/components/ui/skeleton.js';

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
                                <div className="animate__animated animate__fadeIn animate__faster space-y-4">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-20 w-full" />
                                </div>
                            ) : (
                                <div className="animate__animated animate__fadeIn animate__faster">
                                    <Outlet />
                                </div>
                            )}
                        </main>
                    </div>
                </div>

                <Toaster position="top-center" />
            </div>
        </SlugContext.Provider>
    );
}
