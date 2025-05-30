import { Link } from 'react-router-dom';

type Props = {
    slug?: string;
    klubbnavn: string;
};

export default function NavbarBrandMedKlubb({ slug, klubbnavn }: Props) {
    const logoSrc = slug
        ? `/klubber/${slug}/img/logo.webp`
        : '/klubber/default/img/logo.webp';

    return (
        <Link
            to={slug ? `/${slug}` : '/'}
            className="flex items-center gap-2 text-base font-semibold text-gray-800 hover:text-black"
        >
            <img
                src={logoSrc}
                onError={(e) => (e.currentTarget.src = '/klubber/default/img/logo.webp')}
                alt="Logo"
                width={32}
                height={32}
                className="h-8 w-8 rounded-sm"
            />
            {klubbnavn}
        </Link>
    );
}
