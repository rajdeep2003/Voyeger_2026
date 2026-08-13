import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../../../context/AppContext";
import Profile from "../../../pages/Profile";

const DEFAULT_PROFILE_ICON =
	"https://imgs.search.brave.com/XLM6WQZOOjg4USteTMmA56CbGwKhBGOcLHTpbDno-xU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMjE3/MTM4MjYzMy92ZWN0/b3IvdXNlci1wcm9m/aWxlLWljb24tYW5v/bnltb3VzLXBlcnNv/bi1zeW1ib2wtYmxh/bmstYXZhdGFyLWdy/YXBoaWMtdmVjdG9y/LWlsbHVzdHJhdGlv/bi5qcGc_cz02MTJ4/NjEyJnc9MCZrPTIw/JmM9WndPRjZOZk9S/MHpoWUM0NHhPWDA2/cnlJUEFVaER2QWFq/clBzYVo2djEtdz0";

const searchDestinations = [
	{ name: "Bishnupur", path: "/bishupur" },
	{ name: "Doars", path: "/doars" },
	{ name: "Jhargram", path: "/jhargram" },
	{ name: "Kankrajhor", path: "/kankrajhor" },
	{ name: "Ayodha Pahar", path: "/AyodhaPahar" },
	{ name: "Jaldapara National Park", path: "/jaldapara" },
	{ name: "Sandakhpu", path: "/sandakhpu" },
	{ name: "Kalimpong", path: "/kalimpong" },
	{ name: "Purulia", path: "/purulia" },
	{ name: "Kashmir", path: "/kashmir" },
	{ name: "Delhi", path: "/delhi" },
	{ name: "Paris", path: "/paris" },
	{ name: "Kerala", path: "/kerala" },
	{ name: "Andaman", path: "/andaman" },
	{ name: "Digha", path: "/digha" },
	{ name: "Monuments", path: "/monuments" },
];

const navLinks = [
	{ label: "Home", path: "/home" },
	{ label: "Weather", path: "/weather" },
	{ label: "Map", path: "/map" },
	{ label: "Booking", path: "/booking" },
	{ label: "Community", path: "/community" },
	{ label: "Emergency", path: "/emergency" },
	{ label: "Contact", path: "/contact" },
	{ label: "Monuments", path: "/monuments" },
	{ label: "AI Copilot", path: "/ai-copilot" },
];

const Navbar = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { user, profileOpen, setProfileOpen } = useAppContext();
	const [searchQuery, setSearchQuery] = useState("");
	const [showResults, setShowResults] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);

	const searchResults = useMemo(() => {
		if (!searchQuery.trim()) {
			return [];
		}
		return searchDestinations.filter((destination) =>
			destination.name.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	}, [searchQuery]);

	const handleSearchSubmit = (event) => {
		event.preventDefault();
		if (searchResults.length > 0) {
			navigate(searchResults[0].path);
			setSearchQuery("");
			setShowResults(false);
		}
	};

	const handleResultClick = (path) => {
		navigate(path);
		setSearchQuery("");
		setShowResults(false);
	};

	useEffect(() => {
		const closeResults = () => setShowResults(false);
		document.addEventListener("click", closeResults);
		return () => document.removeEventListener("click", closeResults);
	}, []);

	return (
		<>
		<nav className="fixed inset-x-0 top-0 z-50 bg-[#ebebeb]/95 backdrop-blur-md">
			<div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-3 sm:px-5 lg:px-8">
				<div className="flex items-center gap-2 sm:gap-5">
					<button
						type="button"
						className="inline-flex items-center justify-center text-black border rounded-full h-9 w-9 border-black/25 lg:hidden"
						onClick={() => setMobileOpen((prev) => !prev)}
						aria-label="Toggle navigation"
					>
						<span className="h-[2px] w-4 bg-black" />
					</button>

					<Link
						to="/home"
						className="inline-flex items-center gap-1.5 text-base font-medium font-black tracking-tight text-black sm:gap-2 sm:text-lg"
					>
						<img
							src="/images/mountains.png"
							alt="Voyager logo"
							className="mt-0.5 h-4 w-4 object-contain sm:mt-1 sm:h-5 sm:w-5"
						/>
						<span className="hidden sm:inline">VOYAGER</span>
					</Link>
				</div>

				<div className="items-center hidden gap-10 text-sm font-medium tracking-wide uppercase lg:flex">
					{navLinks.slice(0, 4).map((item) => (
						<Link
							key={item.path}
							to={item.path}
							className={`transition-colors ${
								location.pathname === item.path ? "text-black" : "text-black/55 hover:text-black"
							}`}
						>
							{item.label}
						</Link>
					))}
				</div>

				<div className="items-center hidden gap-10 text-sm font-medium tracking-wide uppercase xl:flex">
					{navLinks.slice(4).map((item) => (
						<Link
							key={item.path}
							to={item.path}
							className={`transition-colors ${
								location.pathname === item.path ? "text-black" : "text-black/55 hover:text-black"
							}`}
						>
							{item.label}
						</Link>
					))}
				</div>

				<div className="flex items-center gap-2 sm:gap-3" onClick={(e) => e.stopPropagation()}>
					<div className="relative">
						<form onSubmit={handleSearchSubmit}>
							<input
								type="text"
								value={searchQuery}
								onChange={(event) => {
									setSearchQuery(event.target.value);
									setShowResults(event.target.value.trim().length > 0);
								}}
								placeholder="Search places..."
								className="h-10 w-32 rounded-full border border-black/40 bg-transparent px-3 text-xs text-black placeholder:text-black/55 focus:outline-none focus:ring-1 focus:ring-black/20 sm:w-40 sm:px-4 sm:text-sm md:w-56"
							/>
						</form>

						{showResults && searchResults.length > 0 && (
							<div className="absolute right-0 top-12 z-50 max-h-64 w-64 overflow-y-auto rounded-xl border border-black/20 bg-[#f3f3f3] shadow-xl">
								{searchResults.map((result) => (
									<button
										key={result.path}
										type="button"
										onClick={() => handleResultClick(result.path)}
										className="block w-full px-4 py-3 text-sm text-left text-black border-b border-black/10 hover:bg-black/5"
									>
										{result.name}
									</button>
								))}
							</div>
						)}
					</div>

					{user ? (
						<button
							type="button"
							onClick={() => setProfileOpen(true)}
							className="h-9 w-9 overflow-hidden rounded-full border border-black/25 object-cover transition hover:border-black/50 sm:h-10 sm:w-10"
							aria-label="Open profile"
							title="Open profile"
						>
							<img
								src={DEFAULT_PROFILE_ICON}
								alt="Profile"
								className="object-cover w-full h-full"
							/>
						</button>
					) : (
						<div className="flex items-center gap-2">
							<Link
								to="/login"
								className="hidden rounded-full border border-black/30 px-3 py-1.5 text-xs font-medium text-black transition hover:bg-black/5 md:inline-flex"
							>
								Login
							</Link>
							<Link
								to="/register"
								className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/30 text-black transition hover:bg-black/5 md:h-auto md:w-auto md:px-3 md:py-1.5 md:text-xs md:font-medium"
								aria-label="Sign up"
							>
								<span className="md:hidden">+</span>
								<span className="hidden md:inline">Sign Up</span>
							</Link>
						</div>
					)}
				</div>
			</div>

			{mobileOpen && (
				<div className="border-t border-black/20 bg-[#ebebeb] px-5 py-4 lg:hidden">
					<div className="grid grid-cols-2 gap-3 text-xs font-bold tracking-wide uppercase">
						{navLinks.map((item) => (
							<Link
								key={item.path}
								to={item.path}
								className={`rounded-md px-3 py-2 ${
									location.pathname === item.path ? "bg-black text-[#ebebeb]" : "bg-black/5 text-black"
								}`}
								onClick={() => setMobileOpen(false)}
							>
								{item.label}
							</Link>
						))}
					</div>
				</div>
			)}

			<div className="absolute bottom-0 h-px pointer-events-none left-5 right-5 bg-black/20 lg:left-8 lg:right-8" />
		</nav>
		<Profile isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
		</>
	);
};

export default Navbar;
