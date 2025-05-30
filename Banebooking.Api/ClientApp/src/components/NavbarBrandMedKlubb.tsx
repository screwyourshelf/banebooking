type Props = {
    slug?: string;
    klubbnavn: string;
};

export default function NavbarBrandMedKlubb({ slug, klubbnavn }: Props) {
    return (
        <a
            href="/"
            className="flex items-center gap-2 text-base font-semibold text-gray-800 hover:text-black"
        >
            <img
                src={`/klubber/${slug}/img/logo.webp`}
                onError={(e) => (e.currentTarget.src = '/klubblogoer/default.webp')}
                alt="Klubblogo"
                width={32}
                height={32}
                className="h-8 w-8 rounded-sm"
            />
            {klubbnavn}
        </a>
    );
}
