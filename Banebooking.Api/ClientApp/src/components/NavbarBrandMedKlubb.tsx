import { Navbar } from 'react-bootstrap';

type Props = {
    slug?: string;
    klubbnavn: string;
};

export default function NavbarBrandMedKlubb({ slug, klubbnavn }: Props) {
    return (
        <Navbar.Brand href="/" className="fw-bold py-0 px-2 m-0 d-flex align-items-center gap-2">
            <img
                src={`/klubber/${slug}/img/logo.webp`}
                onError={(e) => (e.currentTarget.src = '/klubblogoer/default.webp')}
                alt="Klubblogo"
                width="32"
                height="32"
                className="d-inline-block align-top"
            />
            {klubbnavn}
        </Navbar.Brand>
    );
}
