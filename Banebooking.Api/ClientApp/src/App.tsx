import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import IndexPage from './pages/IndexPage';
import MinSide from './pages/MinSide';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<IndexPage />} />
                    <Route
                        path="minside"
                        element={
                            <ProtectedRoute>
                                <MinSide />
                            </ProtectedRoute>
                        }
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
