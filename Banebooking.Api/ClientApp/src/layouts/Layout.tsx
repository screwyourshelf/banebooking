import { Nav, Navbar } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';

export default function Layout() {
    return (
        <>
            <Navbar bg="light" expand="sm" className="border-bottom w-100 p-0 m-0">
                <div className="w-100 d-flex justify-content-between align-items-center px-0">
                    <Navbar.Brand href="/" className="fw-bold py-0 px-2 m-0">
                        Banebooking
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="nav-collapse" className="me-2" />
                </div>
                <Navbar.Collapse id="nav-collapse">
                    <Nav className="ms-auto px-2 py-0">
                        <Nav.Link href="/" className="py-0">Hjem</Nav.Link>
                        <Nav.Link href="/minside" className="py-0">Min side</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>

            <main className="w-100 px-2">
                <Outlet />
            </main>
        </>
    );
}
