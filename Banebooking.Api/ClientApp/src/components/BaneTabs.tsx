import { Nav } from 'react-bootstrap';
import type { Bane } from '../types';

type Props = {
    baner: Bane[];
    valgtBaneId: string;
    onVelgBane: (id: string) => void;
};

export default function BaneTabs({ baner, valgtBaneId, onVelgBane }: Props) {
    return (
        <Nav
            variant="tabs"
            activeKey={valgtBaneId}
            onSelect={(baneId) => baneId && onVelgBane(baneId)}
            className="pt-1 flex-nowrap"
            style={{ whiteSpace: 'nowrap' }}
        >
            {baner.map((bane) => (
                <Nav.Item key={bane.id}>
                    <Nav.Link eventKey={bane.id}>{bane.navn}</Nav.Link>
                </Nav.Item>
            ))}
        </Nav>
    );
}
