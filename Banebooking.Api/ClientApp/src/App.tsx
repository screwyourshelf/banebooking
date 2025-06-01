import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout.js';
import IndexPage from './pages/IndexPage.js';
import MinSide from './pages/MinSidePage.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';
import ReglementPage from './pages/ReglementPage.js';
import RedigerKlubbPage from './pages/admin/RedigerKlubbPage.js';
import RedigerBanerPage from './pages/admin/RedigerBanerPage.js';
import ArrangementPage from './pages/utvidet/ArrangementPage.js';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path=":slug" element={<Layout />}>
                    <Route index element={<IndexPage />} />
                    <Route
                        path="minside"
                        element={
                            <ProtectedRoute>
                                <MinSide />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="reglement" element={<ReglementPage />} />

                    {/* Admin routes */}
                    <Route path="admin">
                        <Route
                            path="klubb"
                            element={
                                <ProtectedRoute>
                                    <RedigerKlubbPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="baner"
                            element={
                                <ProtectedRoute>
                                    <RedigerBanerPage />
                                </ProtectedRoute>
                            }
                        />
                    </Route>

                    <Route
                        path="arrangement"
                        element={
                            <ProtectedRoute>
                                <ArrangementPage />
                            </ProtectedRoute>
                        }
                    />

                </Route>

                {/* Root route uten slug */}
                <Route path="/" element={<Layout />}>
                    <Route index element={<div>Velkommen! Velg klubb.</div>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
