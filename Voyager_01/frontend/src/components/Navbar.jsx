"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { FaTimes } from "react-icons/fa"
import { useTranslation } from "react-i18next"
import LanguageChanger from "./LanguageChanger"
import { useAppContext } from "../context/AppContext"
import Profile from "../pages/Profile"

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
]

const sidebarItemsMapping = [
  { label: "navbar.sidebarItems.home", path: "/home" },
  { label: "navbar.sidebarItems.weather", path: "/weather" },
  { label: "navbar.sidebarItems.map", path: "/map" },
  { label: "navbar.sidebarItems.booking", path: "/booking" },
  { label: "navbar.sidebarItems.community", path: "/community" },
  { label: "navbar.sidebarItems.emergency", path: "/emergency" },
  { label: "navbar.sidebarItems.contact", path: "/contact" },
  { label: "Monuments", path: "/monuments" },
]

const Navbar = () => {
  const { profileOpen, setProfileOpen, sidebarOpen, setSidebarOpen, userDetails } = useAppContext()
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAppContext()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)

  // Handle search input changes
  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.length > 0) {
      const results = searchDestinations.filter((destination) =>
        destination.name.toLowerCase().includes(query.toLowerCase()),
      )
      setSearchResults(results)
      setShowResults(true)
    } else {
      setSearchResults([])
      setShowResults(false)
    }
  }
  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchResults.length > 0) {
      navigate(searchResults[0].path)
      setSearchQuery("")
      setShowResults(false)
    }
  }

  // Handle clicking on a search result
  const handleResultClick = (path) => {
    navigate(path)
    window.scrollTo(0, 0)
    setSearchQuery("")
    setShowResults(false)
  }

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showResults) {
        setShowResults(false)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [showResults])

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full h-16 border-b border-gray-700 shadow-lg bg-gradient-to-r from-gray-900 to-gray-800 backdrop-blur-md">
        <div className="flex items-center justify-between h-full px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center space-x-4 ">
            {/* Hamburger */}
            <button
              className="relative w-8 h-8 focus:outline-none group"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={t("navbar.menuToggle")}
            >
              <span
                className={`absolute left-0 w-full h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out 
                ${sidebarOpen ? "top-1/2 transform -translate-y-1/2 rotate-45" : "top-1/4"}`}
              ></span>
              <span
                className={`absolute left-0 w-full h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out 
                ${sidebarOpen ? "opacity-0" : "top-1/2 transform -translate-y-1/2"}`}
              ></span>
              <span
                className={`absolute left-0 w-full h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out 
                ${sidebarOpen ? "top-1/2 transform -translate-y-1/2 -rotate-45" : "top-3/4"}`}
              ></span>
            </button>

            {/* Logo */}
            <Link
              to="/"
              className="text-2xl font-bold tracking-tight text-white transition-colors duration-300 hover:text-cyan-400"
            >
              <span className="text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text">
                {t("navbar.logoText")}
              </span>
            </Link>
          </div>

          {/* Right: Search + Auth/Profile */}
          <div className="flex items-center space-x-6">
            {/* Search bar (navbar always) */}
            <div className="relative hidden md:block">
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder={t("navbar.searchPlaceholder")}
                  className="w-64 h-10 px-4 pl-10 text-sm text-white placeholder-gray-400 transition-all duration-300 ease-in-out bg-gray-800 border border-white rounded-full shadow-sm hover:w-72 focus:w-80 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  type="submit"
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-cyan-400"
                  aria-label={t("navbar.searchButton")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </form>

              {/* Search results dropdown */}
              {showResults && searchResults.length > 0 && (
                <div
                  className="absolute left-0 right-0 z-50 overflow-y-auto bg-gray-800 border border-gray-700 rounded-lg shadow-xl top-12 max-h-60"
                  onClick={(e) => e.stopPropagation()}
                >
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-center px-4 py-3 text-white cursor-pointer hover:bg-gray-700"
                      onClick={() => handleResultClick(result.path)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 mr-2 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>{result.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Owner's section button (desktop only) */}
            {user?.role === "owner" && (
              <Link
                to="/hotelApp"
                className="hidden px-4 py-2 ml-4 text-sm font-semibold text-white transition-all rounded-full shadow-md md:inline-block bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:shadow-pink-500/20"
                style={{ whiteSpace: "nowrap" }}
              >
                Owner's section
              </Link>
            )}

            {/* Auth/Profile */}
            {user == null ? (
              <div className="flex gap-3">
                <Link
                  to="/login"
                  className="hidden px-4 py-2 text-sm font-semibold text-white transition-all rounded-full shadow-md bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 hover:shadow-cyan-500/20 md:inline-block"
                >
                  {t("navbar.login")}
                </Link>
                <Link
                  to="/register"
                  className="relative inline-flex items-center justify-center w-12 h-12 md:w-auto md:h-auto md:px-4 md:py-2 text-sm font-semibold text-gray-900 transition bg-white rounded-full shadow-md hover:bg-gray-100 hover:shadow-white/20 group"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 md:hidden"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M12 14c-5 0-8 2.5-8 5v2h16v-2c0-2.5-3-5-8-5z" />
                  </svg>
                  <span className="hidden md:inline">{t("navbar.register")}</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {/* Profile Button on Desktop */}
                <button
                onClick={() => setProfileOpen(true)}
                className="relative w-12 h-12 overflow-hidden transition-all duration-200 border-3 rounded-full shadow-lg border-cyan-400 hover:border-cyan-300 hover:shadow-cyan-400/40 hover:scale-110 group"
                aria-label={t("navbar.profileButton")}
              >
                <img
                  src={userDetails?.avatarUrl || "https://imgs.search.brave.com/XLM6WQZOOjg4USteTMmA56CbGwKhBGOcLHTpbDno-xU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMjE3/MTM4MjYzMy92ZWN0/b3IvdXNlci1wcm9m/aWxlLWljb24tYW5v/bnltb3VzLXBlcnNv/bi1zeW1ib2wtYmxh/bmstYXZhdGFyLWdy/YXBoaWMtdmVjdG9y/LWlsbHVzdHJhdGlv/bi5qcGc_cz02MTJ4/NjEyJnc9MCZrPTIw/JmM9WndPRjZOZk9S/MHpoWUM0NHhPWDA2/cnlJUEFVaER2QWFq/clBzYVo2djEtdz0"}
                  alt={t("navbar.profileImageAlt")}
                  className="object-cover w-full h-full"
                />
                <div className="absolute right-0 px-3 py-1 text-xs font-semibold text-white rounded-full top-0 bg-cyan-500">
                  ✓
                </div>
              </button>
                {/* User Name on Desktop */}
                <div className="hidden md:block">
                  <p className="text-xs uppercase tracking-widest text-cyan-400">{userDetails?.role || "User"}</p>
                  <p className="text-sm font-semibold text-white truncate max-w-[150px]">{userDetails?.name || "Profile"}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-gray-900 to-gray-800 z-40 shadow-2xl
        transform transition-all duration-500 ease-in-out border-r border-gray-700
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col justify-between h-full p-6">
          {/* Close button */}
          <button
            className="self-end mb-6 text-gray-300 transition-all duration-300 hover:scale-110 hover:text-cyan-400"
            onClick={() => setSidebarOpen(false)}
            aria-label={t("navbar.closeMenu")}
          >
            <FaTimes size={24} />
          </button>

          {/* Mobile search bar only */}
          <div className="mb-8 md:hidden">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={t("navbar.searchPlaceholder")}
                className="w-full h-10 px-4 pl-10 text-sm text-white placeholder-gray-400 bg-gray-800 border border-gray-600 rounded-full shadow-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              {/* Mobile search results */}
              {showResults && searchResults.length > 0 && (
                <div
                  className="absolute left-0 right-0 z-50 overflow-y-auto bg-gray-800 border border-gray-700 rounded-lg shadow-xl top-12 max-h-60"
                  onClick={(e) => e.stopPropagation()}
                >
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-center px-4 py-3 text-white cursor-pointer hover:bg-gray-700"
                      onClick={() => handleResultClick(result.path)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 mr-2 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>{result.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Links */}
          <ul className="flex-1 space-y-3 overflow-y-auto">
            {sidebarItemsMapping.map((item, index) => (
              <li
                key={index}
                className="transition-all duration-500 ease-out"
                style={{
                  transform: sidebarOpen ? "translateX(0)" : "translateX(-20px)",
                  opacity: sidebarOpen ? 1 : 0,
                  transitionDelay: `${index * 80}ms`,
                }}
              >
                {/* <Link
                  to={user == null ? "/login" : item.path}
                  className={`flex items-center px-4 py-3 rounded-lg 
                    hover:bg-gray-700/50 hover:text-cyan-400 transition-all duration-300
                    ${
                      location.pathname === item.path ? "bg-gray-700/50 text-cyan-400 font-semibold" : "text-gray-300"
                    }`}
                  onClick={() => {
                    setSidebarOpen(false)
                    window.scrollTo(0, 0)
                  }}
                > */}
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg 
                    hover:bg-gray-700/50 hover:text-cyan-400 transition-all duration-300
                    ${
                      location.pathname === item.path ? "bg-gray-700/50 text-cyan-400 font-semibold" : "text-gray-300"
                    }`}
                  onClick={() => {
                    setSidebarOpen(false)
                    window.scrollTo(0, 0)
                  }}
                >
                  <span className="flex-1 text-left">{t(item.label)}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>

          {/* Language Changer */}
          <div className="pt-6 mt-8 border-t border-gray-700">
            <LanguageChanger />
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 transition-opacity duration-500 bg-black bg-opacity-70 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Profile Slideout */}
      <Profile isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  )
}

export default Navbar
