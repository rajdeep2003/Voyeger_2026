"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Loader2, MapPin, Search, Sparkles } from "lucide-react";

const API_BASE = "https://voyeger2026-backend.onrender.com/api";
const VALLEY_OF_KINGS_IMAGE = "/images/valley-of-kings.png";
const DEFAULT_MONUMENT_IMAGE =
	"https://images.unsplash.com/photo-1526481280698-8fcc13fd44f8?auto=format&fit=crop&w=1600&q=80";

const titleSvg = (
	<svg width="1319" height="47" viewBox="0 0 1319 47" fill="none" xmlns="http://www.w3.org/2000/svg" className="block w-full h-auto">
		<path d="M2.14577e-06 45.824V1.02399H79.36V13.952H19.84V17.92H72.448V28.928H19.84V32.896H79.36V45.824H2.14577e-06ZM80.8265 45.824L106.747 23.488L80.8265 1.02399H106.427L120.571 13.888L134.779 1.02399H160.187L134.267 23.36L160.187 45.824H134.587L120.443 32.96L106.235 45.824H80.8265ZM162.875 45.824V1.02399H223.611C229.798 1.02399 234.342 2.28266 237.243 4.8C240.144 7.27466 241.595 11.0507 241.595 16.128C241.595 19.5413 240.955 22.5707 239.675 25.216C238.438 27.8613 236.496 29.952 233.851 31.488C231.206 32.9813 227.792 33.728 223.611 33.728H182.715V45.824H162.875ZM218.235 14.656H182.715V20.288H218.235C219.046 20.288 219.686 20.032 220.155 19.52C220.624 19.008 220.859 18.3253 220.859 17.472C220.859 16.576 220.603 15.8933 220.091 15.424C219.622 14.912 219.003 14.656 218.235 14.656ZM246.188 45.824V1.02399H266.028V30.976H325.548V45.824H246.188ZM366.257 46.848C358.15 46.848 351.11 45.9307 345.137 44.096C339.206 42.2187 334.62 39.552 331.377 36.096C328.177 32.64 326.577 28.544 326.577 23.808V23.04C326.577 18.2613 328.177 14.1653 331.377 10.752C334.62 7.296 339.206 4.65066 345.137 2.81599C351.11 0.938662 358.15 -3.8147e-06 366.257 -3.8147e-06C374.406 -3.8147e-06 381.446 0.938662 387.377 2.81599C393.308 4.65066 397.873 7.296 401.073 10.752C404.316 14.1653 405.937 18.2613 405.937 23.04V23.808C405.937 28.544 404.316 32.64 401.073 36.096C397.873 39.552 393.308 42.2187 387.377 44.096C381.446 45.9307 374.406 46.848 366.257 46.848ZM366.257 32.128C372.102 32.128 376.71 31.4027 380.081 29.952C383.494 28.4587 385.201 26.4107 385.201 23.808V23.04C385.201 20.4373 383.494 18.4107 380.081 16.96C376.71 15.4667 372.102 14.72 366.257 14.72C360.454 14.72 355.846 15.4667 352.433 16.96C349.02 18.4107 347.313 20.4373 347.313 23.04V23.808C347.313 26.4107 349.02 28.4587 352.433 29.952C355.846 31.4027 360.454 32.128 366.257 32.128ZM411.063 45.824V1.02399H474.871C479.436 1.02399 482.935 2.048 485.367 4.096C487.799 6.10133 489.015 8.87466 489.015 12.416C489.015 15.1467 488.183 17.3653 486.519 19.072C484.855 20.7787 482.252 21.952 478.711 22.592V23.872C482.593 24.2133 485.516 25.3227 487.479 27.2C489.441 29.0347 490.423 31.424 490.423 34.368V45.824H469.687V35.008C469.687 34.24 469.452 33.6213 468.983 33.152C468.513 32.6827 467.873 32.448 467.063 32.448H430.903V45.824H411.063ZM430.903 20.288H465.783C466.593 20.288 467.233 20.032 467.703 19.52C468.172 19.008 468.407 18.3253 468.407 17.472C468.407 16.5333 468.151 15.8293 467.639 15.36C467.127 14.8907 466.508 14.656 465.783 14.656H430.903V20.288ZM496.188 45.824V1.02399H575.548V13.952H516.028V17.92H568.636V28.928H516.028V32.896H575.548V45.824H496.188ZM626.508 45.824V15.872H596.748V1.02399H676.108V15.872H646.348V45.824H626.508ZM680.75 45.824V1.02399H700.59V15.68H740.27V1.02399H760.11V45.824H740.27V29.888H700.59V45.824H680.75ZM767.563 45.824V1.02399H846.923V13.952H787.403V17.92H840.011V28.928H787.403V32.896H846.923V45.824H767.563ZM892.001 45.824L866.657 1.02399H888.865L903.137 29.184L918.049 1.02399H937.441L951.713 29.184L966.625 1.02399H988.833L963.425 45.824H940.577L927.713 21.376L914.849 45.824H892.001ZM1024.94 46.848C1016.84 46.848 1009.8 45.9307 1003.82 44.096C997.894 42.2187 993.307 39.552 990.065 36.096C986.865 32.64 985.265 28.544 985.265 23.808V23.04C985.265 18.2613 986.865 14.1653 990.065 10.752C993.307 7.296 997.894 4.65066 1003.82 2.81599C1009.8 0.938662 1016.84 -3.8147e-06 1024.94 -3.8147e-06C1033.09 -3.8147e-06 1040.13 0.938662 1046.06 2.81599C1052 4.65066 1056.56 7.296 1059.76 10.752C1063 14.1653 1064.62 18.2613 1064.62 23.04V23.808C1064.62 28.544 1063 32.64 1059.76 36.096C1056.56 39.552 1052 42.2187 1046.06 44.096C1040.13 45.9307 1033.09 46.848 1024.94 46.848ZM1024.94 32.128C1030.79 32.128 1035.4 31.4027 1038.77 29.952C1042.18 28.4587 1043.89 26.4107 1043.89 23.808V23.04C1043.89 20.4373 1042.18 18.4107 1038.77 16.96C1035.4 15.4667 1030.79 14.72 1024.94 14.72C1019.14 14.72 1014.53 15.4667 1011.12 16.96C1007.71 18.4107 1006 20.4373 1006 23.04V23.808C1006 26.4107 1007.71 28.4587 1011.12 29.952C1014.53 31.4027 1019.14 32.128 1024.94 32.128ZM1069.75 45.824V1.02399H1133.56C1138.12 1.02399 1141.62 2.048 1144.05 4.096C1146.49 6.10133 1147.7 8.87466 1147.7 12.416C1147.7 15.1467 1146.87 17.3653 1145.21 19.072C1143.54 20.7787 1140.94 21.952 1137.4 22.592V23.872C1141.28 24.2133 1144.2 25.3227 1146.17 27.2C1148.13 29.0347 1149.11 31.424 1149.11 34.368V45.824H1128.37V35.008C1128.37 34.24 1128.14 33.6213 1127.67 33.152C1127.2 32.6827 1126.56 32.448 1125.75 32.448H1089.59V45.824H1069.75ZM1089.59 20.288H1124.47C1125.28 20.288 1125.92 20.032 1126.39 19.52C1126.86 19.008 1127.09 18.3253 1127.09 17.472C1127.09 16.5333 1126.84 15.8293 1126.33 15.36C1125.81 14.8907 1125.2 14.656 1124.47 14.656H1089.59V20.288ZM1154.88 45.824V1.02399H1174.72V30.976H1234.24V45.824H1154.88ZM1238.94 45.824V1.02399H1291.99C1297.33 1.02399 1301.96 1.91999 1305.88 3.71199C1309.85 5.50399 1312.9 8.04266 1315.03 11.328C1317.21 14.6133 1318.3 18.5173 1318.3 23.04V23.808C1318.3 28.3307 1317.21 32.2347 1315.03 35.52C1312.9 38.8053 1309.85 41.344 1305.88 43.136C1301.96 44.928 1297.33 45.824 1291.99 45.824H1238.94ZM1258.78 31.36H1290.07C1292.33 31.36 1294.15 30.6987 1295.51 29.376C1296.88 28.0107 1297.56 26.1547 1297.56 23.808V23.04C1297.56 20.6933 1296.88 18.8587 1295.51 17.536C1294.15 16.1707 1292.33 15.488 1290.07 15.488H1258.78V31.36Z" fill="#323232"/>
	</svg>
);

const vibeOptions = [
	"overview",
	"culture",
	"history",
	"bestTime",
];

const MonumentsPage = () => {
	const [monuments, setMonuments] = useState([]);
	const [selectedId, setSelectedId] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [vibe, setVibe] = useState("overview");

	useEffect(() => {
		let isMounted = true;

		fetch(`${API_BASE}/monuments/getAll`)
			.then((response) => {
				if (!response.ok) {
					throw new Error("Failed to load monuments");
				}
				return response.json();
			})
			.then((data) => {
				if (!isMounted) {
					return;
				}

				const normalized = Array.isArray(data)
					? data.map((monument) => {
						const name = monument?.name || "";
						const isValleyOfKings = name.toLowerCase().includes("valley of kings");

						return {
							...monument,
							imgUrl: isValleyOfKings
								? VALLEY_OF_KINGS_IMAGE
								: monument?.imgUrl || monument?.imageUrl || DEFAULT_MONUMENT_IMAGE,
						};
					})
					: [];
				setMonuments(normalized);
				setSelectedId((previousId) => previousId || normalized[0]?._id || null);
			})
			.catch((fetchError) => {
				if (isMounted) {
					console.error(fetchError);
					setError("Unable to load monuments right now.");
				}
			})
			.finally(() => {
				if (isMounted) {
					setLoading(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, []);

	const filteredMonuments = useMemo(() => {
		const query = searchTerm.trim().toLowerCase();

		return monuments.filter((monument) => {
			const name = monument?.name || "";
			const address = monument?.location?.address || "";
			const district = monument?.location?.district || "";

			return [name, address, district].some((value) => value.toLowerCase().includes(query));
		});
	}, [monuments, searchTerm]);

	const selectedMonument = useMemo(
		() => filteredMonuments.find((monument) => monument._id === selectedId) || filteredMonuments[0] || monuments[0] || null,
		[filteredMonuments, monuments, selectedId]
	);

	const visibleCount = filteredMonuments.length;
	const totalCount = monuments.length;

	const metricCards = useMemo(() => {
		const regions = new Set(
			monuments
				.map((monument) => monument?.location?.district || monument?.location?.state || monument?.location?.address)
				.filter(Boolean)
		);

		return [
			{ label: "Monuments", value: String(totalCount).padStart(2, "0") },
			{ label: "Visible", value: String(visibleCount).padStart(2, "0") },
			{ label: "Regions", value: String(regions.size).padStart(2, "0") },
		];
	}, [monuments, totalCount, visibleCount]);

	const selectedNarrative = selectedMonument?.overview?.[vibe] || selectedMonument?.overview?.professor || selectedMonument?.overview?.local || selectedMonument?.overview?.fun || selectedMonument?.overview?.cynical || "";

	const heroImage = selectedMonument?.imgUrl || DEFAULT_MONUMENT_IMAGE;

	return (
		<div className="min-h-screen bg-[#ebebeb] text-[#161616]">
			<section className="mx-auto flex max-w-[1720px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-10">
				<div className="pb-6 border-b border-black/10">
					<div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
						<div className="max-w-[1180px]">
							<div className="mb-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-black/45" style={{ fontFamily: '"Cal Sans", sans-serif' }}>
								<Sparkles className="h-3.5 w-3.5" />
								Monument atlas
							</div>
							<div className="w-full max-w-[1319px]">
								{titleSvg}
							</div>
						</div>

						<div className="flex w-full max-w-[320px] items-center border border-black/15 bg-white/60 px-4 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.05)] backdrop-blur-sm lg:justify-self-end">
							<Search className="w-4 h-4 mr-3 text-black/45" />
							<input
								value={searchTerm}
								onChange={(event) => setSearchTerm(event.target.value)}
								placeholder="Search monuments, districts, or states"
								className="w-full bg-transparent text-sm font-medium text-[#161616] outline-none placeholder:text-black/35"
							/>
						</div>
					</div>

					<p className="max-w-3xl mt-5 text-sm leading-7 text-black/68 sm:text-base" style={{ fontFamily: '"Cal Sans", sans-serif' }}>
                        Discover the world's most iconic monuments through immersive narratives, stunning visuals, and interactive exploration. 
					</p>
				</div>

				<div className="grid gap-4 sm:grid-cols-3">
					{metricCards.map((metric) => (
						<div key={metric.label} className="border border-black/10 bg-white/65 px-5 py-4 shadow-[0_14px_32px_rgba(0,0,0,0.05)]">
							<p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-black/42" style={{ fontFamily: '"Cal Sans", sans-serif' }}>
								{metric.label}
							</p>
							<p className="mt-2 text-3xl font-semibold tracking-tight text-[#111111]" style={{ fontFamily: '"Cal Sans", sans-serif' }}>
								{metric.value}
							</p>
						</div>
					))}
				</div>

				<div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
					<div className="space-y-5">
						<div className="flex flex-wrap gap-3 pb-4 border-b border-black/10">
							{vibeOptions.map((option) => (
								<button
									key={option}
									type="button"
									onClick={() => setVibe(option)}
									className={`border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition ${
										vibe === option
											? "border-black bg-black text-[#ebebeb]"
											: "border-black/15 bg-white/55 text-black/60 hover:border-black/30 hover:text-black"
									}`}
									style={{ fontFamily: '"Cal Sans", sans-serif' }}
								>
									{option}
								</button>
							))}
						</div>

						{loading ? (
							<div className="flex min-h-[420px] items-center justify-center border border-black/10 bg-white/55">
								<div className="text-center">
									<Loader2 className="mx-auto h-7 w-7 animate-spin text-black/45" />
									<p className="mt-3 text-sm font-medium uppercase tracking-[0.24em] text-black/50" style={{ fontFamily: '"Cal Sans", sans-serif' }}>
										Loading monuments
									</p>
								</div>
							</div>
						) : error ? (
							<div className="p-8 border border-black/10 bg-white/55">
								<p className="text-sm font-medium uppercase tracking-[0.22em] text-black/45" style={{ fontFamily: '"Cal Sans", sans-serif' }}>
									Error
								</p>
								<p className="mt-3 text-lg font-semibold text-[#111111]">{error}</p>
							</div>
						) : (
							<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
								{filteredMonuments.map((monument) => {
									const isSelected = selectedMonument?._id === monument._id;
									const subtitle = monument?.location?.address || monument?.location?.district || monument?.location?.state || "Location unavailable";

									return (
										<button
											key={monument._id}
											type="button"
											onClick={() => setSelectedId(monument._id)}
											className={`group flex h-full flex-col border bg-white/70 text-left shadow-[0_14px_36px_rgba(0,0,0,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(0,0,0,0.09)] ${
												isSelected ? "border-black/50" : "border-black/10"
											}`}
										>
											<div className="relative aspect-[4/3] overflow-hidden bg-[#d8d8d8]">
												<img
													src={monument?.imgUrl}
													alt={monument?.name || "Monument"}
													className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
													onError={(event) => {
														event.currentTarget.src = DEFAULT_MONUMENT_IMAGE;
													}}
													loading="lazy"
												/>
												<div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/55 via-black/15 to-transparent">
													<p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/80" style={{ fontFamily: '"Cal Sans", sans-serif' }}>
														{monument?.location?.state || monument?.location?.district || "Heritage"}
													</p>
												</div>
											</div>

											<div className="flex flex-col flex-1 gap-3 p-4">
												<div>
													<h3 className="text-lg font-semibold leading-tight text-[#111111]" style={{ fontFamily: '"Cal Sans", sans-serif' }}>
														{monument?.name || "Unnamed Monument"}
													</h3>
													<p className="mt-2 text-sm leading-6 text-black/60">{subtitle}</p>
												</div>

												<div className="mt-auto flex items-center justify-between border-t border-black/10 pt-3 text-xs font-semibold uppercase tracking-[0.22em] text-black/48" style={{ fontFamily: '"Cal Sans", sans-serif' }}>
													<span>{monument?.category || "Monument"}</span>
													<span>{isSelected ? "Selected" : "Open"}</span>
												</div>
											</div>
										</button>
									);
								})}

								{!filteredMonuments.length && (
									<div className="p-8 border border-dashed border-black/20 bg-white/50 md:col-span-2 xl:col-span-3">
										<p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/45" style={{ fontFamily: '"Cal Sans", sans-serif' }}>
											No results
										</p>
										<p className="mt-3 text-base text-black/65">
											Try a different monument name, district, or state.
										</p>
									</div>
								)}
							</div>
						)}
					</div>

					<aside className="lg:sticky lg:top-24 h-fit">
						<div className="border border-black/10 bg-white/70 shadow-[0_18px_44px_rgba(0,0,0,0.08)]">
							<div className="p-4 border-b border-black/10">
								<p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-black/42" style={{ fontFamily: '"Cal Sans", sans-serif' }}>
									Featured view
								</p>
								<h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#111111]" style={{ fontFamily: '"Cal Sans", sans-serif' }}>
									{selectedMonument?.name || "Select a monument"}
								</h2>
							</div>

							<div className="border-b border-black/10 bg-[#d7d7d7]">
								<img
									src={heroImage}
									alt={selectedMonument?.name || "Featured monument"}
									className="h-[320px] w-full object-cover"
									onError={(event) => {
										event.currentTarget.src = DEFAULT_MONUMENT_IMAGE;
									}}
								/>
							</div>

							<div className="p-5 space-y-5">
								<div className="grid gap-3 sm:grid-cols-2">
									<div className="border border-black/10 bg-[#f8f8f8] p-4">
										<p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-black/42" style={{ fontFamily: '"Cal Sans", sans-serif' }}>
											Region
										</p>
										<p className="mt-2 text-sm font-medium leading-6 text-[#111111]">
											{selectedMonument?.location?.state || selectedMonument?.location?.district || "Not listed"}
										</p>
									</div>
									<div className="border border-black/10 bg-[#f8f8f8] p-4">
										<p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-black/42" style={{ fontFamily: '"Cal Sans", sans-serif' }}>
											Location
										</p>
										<p className="mt-2 text-sm font-medium leading-6 text-[#111111]">
											{selectedMonument?.location?.address || "Address unavailable"}
										</p>
									</div>
								</div>

								<div>
									<p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-black/42" style={{ fontFamily: '"Cal Sans", sans-serif' }}>
										Narrative
									</p>
									<p className="mt-3 text-sm leading-7 text-black/72">{selectedNarrative || "Pick a monument to reveal a short editorial summary."}</p>
								</div>

								<div className="pt-4 border-t border-black/10">
									<div className="flex items-center justify-between gap-3">
										<p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-black/42" style={{ fontFamily: '"Cal Sans", sans-serif' }}>
											Quick facts
										</p>
										<MapPin className="w-4 h-4 text-black/35" />
									</div>

									<div className="mt-4 space-y-3">
										<div className="flex items-center justify-between pb-2 text-sm border-b border-black/10">
											<span className="text-black/55">Shown results</span>
											<span className="font-semibold text-[#111111]">{visibleCount}</span>
										</div>
										<div className="flex items-center justify-between pb-2 text-sm border-b border-black/10">
											<span className="text-black/55">Selected category</span>
											<span className="font-semibold text-[#111111]">{selectedMonument?.category || "Monument"}</span>
										</div>
										<div className="flex items-center justify-between pb-2 text-sm border-b border-black/10">
											<span className="text-black/55">Preview state</span>
											<span className="font-semibold text-[#111111]">{vibe}</span>
										</div>
									</div>
								</div>

								<div className="flex items-center justify-between pt-4 border-t border-black/10">
									<p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-black/42" style={{ fontFamily: '"Cal Sans", sans-serif' }}>
										Explore next
									</p>
									<ArrowRight className="w-4 h-4 text-black/45" />
								</div>
							</div>
						</div>
					</aside>
				</div>
			</section>
		</div>
	);
};

export default MonumentsPage;
