import React, { useEffect, useState } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';
import { supabase } from '../supabase';
import type { User } from '@supabase/supabase-js';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavbarBrandMedKlubb from '../components/NavbarBrandMedKlubb';
import LoginDropdown from '../components/LoginDropdown';

export const SlugContext = React.createContext<string | undefined>(undefined);

export default function Layout() {
    const { slug } = useParams<{ slug: string }>();
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const slugFromUrl = window.location.pathname.split('/')[1];
    const redirectTo = window.location.origin + (slugFromUrl ? `/${slugFromUrl}` : '/');

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setCurrentUser(user);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setCurrentUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <SlugContext.Provider value={slug}>
            <Navbar bg="light" expand="sm" className="border-bottom w-100 p-1 m-0">
                <div className="w-100 d-flex justify-content-between align-items-center px-0">
                    <NavbarBrandMedKlubb slug={slug} klubbnavn="Ås Tennisklubb" />
                    <Navbar.Toggle aria-controls="nav-collapse" className="me-2" />
                </div>
                <Navbar.Collapse id="nav-collapse">
                    <Nav className="ms-auto px-1 py-0">
                        <LoginDropdown
                            currentUser={currentUser}
                            setCurrentUser={setCurrentUser}
                            redirectTo={redirectTo}
                        />
                    </Nav>
                </Navbar.Collapse>
            </Navbar>

            <main className="w-100 px-2">
                <Outlet />
            </main>

            <ToastContainer position="bottom-center" autoClose={3000} />
        </SlugContext.Provider>
    );
}
