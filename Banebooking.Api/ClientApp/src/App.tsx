import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import IndexPage from './pages/IndexPage';
import MinSide from './pages/MinSide';
import { ProtectedRoute } from './components/ProtectedRoute';
import ReglementPage from './pages/ReglementPage';

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
                </Route>
                {/* Hvis du fortsatt vil ha en root-side uten slug, kan du legge til denne: */}
                <Route path="/" element={<Layout />}>
                    <Route index element={<div>Velkommen! Velg klubb.</div>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
