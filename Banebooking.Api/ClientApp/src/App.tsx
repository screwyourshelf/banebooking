import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import IndexPage from './pages/IndexPage';
import MinSide from './pages/MinSidePage';
import { ProtectedRoute } from './components/ProtectedRoute';
import ReglementPage from './pages/ReglementPage';
import RedigerKlubbPage from './pages/admin/RedigerKlubbPage';
import RedigerBanerPage from './pages/admin/RedigerBanerPage';
import MassebookingPage from './pages/admin/MassebookingPage';

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
                            index
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
                        <Route
                            path="massebooking"
                            element={
                                <ProtectedRoute>
                                    <MassebookingPage />
                                </ProtectedRoute>
                            }
                        />
                    </Route>
                </Route>

                {/* Root route uten slug */}
                <Route path="/" element={<Layout />}>
                    <Route index element={<div>Velkommen! Velg klubb.</div>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
