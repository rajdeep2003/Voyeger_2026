import React, { useState } from "react";
import { FaPlane, FaSearch } from "react-icons/fa";
import { AiOutlineCalendar } from "react-icons/ai";
import { MdOutlinePeople } from "react-icons/md";

const dummyFlights = [
  {
    id: 1,
    from: "Kolkata",
    to: "Mumbai",
    airline: "IndiGo",
    date: "2025-06-15T10:00:00",
    price: 6200,
  },
  {
    id: 2,
    from: "Kolkata",
    to: "Delhi",
    airline: "Air India",
    date: "2025-06-16T14:00:00",
    price: 7500,
  },
  {
    id: 3,
    from: "Mumbai",
    to: "Kolkata",
    airline: "SpiceJet",
    date: "2025-06-17T09:00:00",
    price: 5800,
  },
];

const FlightBooking = () => {
  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");
  const [airlineSearch, setAirlineSearch] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState(1);

  const filteredFlights = dummyFlights.filter((flight) => {
    const matchesFrom = flight.from.toLowerCase().includes(fromSearch.toLowerCase());
    const matchesTo = flight.to.toLowerCase().includes(toSearch.toLowerCase());
    const matchesAirline = flight.airline.toLowerCase().includes(airlineSearch.toLowerCase());
    const matchesDate = date ? flight.date.startsWith(date) : true;

    return matchesFrom && matchesTo && matchesAirline && matchesDate;
  });

  const handleBooking = (flight) => {
    console.log("Booking flight:", {
      ...flight,
      passengers,
    });

    // Add logic here to redirect to checkout page, API call, or toast
    alert(`Flight booked: ${flight.from} → ${flight.to} for ${passengers} passenger(s)!`);
  };

  return (
    <div className="px-4 pb-12 mx-auto max-w-7xl pt-28">
      <h2 className="flex items-center gap-2 mb-10 text-3xl font-bold">
        <FaPlane className="text-blue-500" />
        Book Your Flight
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Sidebar Filters */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center p-3 border-2 rounded-md border-black-300 bg-gray-50">
            <FaSearch className="mr-2 text-gray-500" />
            <input
              type="text"
              placeholder="From"
              value={fromSearch}
              onChange={(e) => setFromSearch(e.target.value)}
              className="w-full bg-transparent outline-none"
            />
          </div>

          <div className="flex items-center p-3 border-2 rounded-md border-black-300 bg-gray-50">
            <FaSearch className="mr-2 text-gray-500" />
            <input
              type="text"
              placeholder="To"
              value={toSearch}
              onChange={(e) => setToSearch(e.target.value)}
              className="w-full bg-transparent outline-none"
            />
          </div>

          <div className="flex items-center p-3 border-2 rounded-md border-black-300 bg-gray-50">
            <FaSearch className="mr-2 text-gray-500" />
            <input
              type="text"
              placeholder="Airline"
              value={airlineSearch}
              onChange={(e) => setAirlineSearch(e.target.value)}
              className="w-full bg-transparent outline-none"
            />
          </div>

          <div className="flex items-center p-3 border-2 rounded-md border-black-300 bg-gray-50">
            <AiOutlineCalendar className="mr-2 text-gray-500" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-transparent outline-none"
            />
          </div>

          <div className="flex items-center p-3 border-2 rounded-md border-black-300 bg-gray-50">
            <MdOutlinePeople className="mr-2 text-gray-500" />
            <select
              value={passengers}
              onChange={(e) => setPassengers(parseInt(e.target.value))}
              className="w-full bg-transparent outline-none"
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} Passenger{i > 0 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Flight Results */}
        <div className="space-y-6 md:col-span-3">
          {filteredFlights.length > 0 ? (
            filteredFlights.map((flight) => (
              <div
                key={flight.id}
                className="flex flex-col items-start justify-between p-6 border rounded-md shadow-sm md:flex-row md:items-center"
              >
                <div>
                  <h3 className="text-xl font-semibold">
                    {flight.from} → {flight.to}
                  </h3>
                  <p className="text-sm text-gray-500">{flight.airline}</p>
                  <p className="text-sm text-gray-500">
                    Departure:{" "}
                    {new Date(flight.date).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-6 mt-4 md:mt-0">
                  <p className="text-lg font-bold text-green-600">
                    ₹{flight.price.toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleBooking(flight)}
                    className="px-4 py-2 text-white transition bg-blue-500 rounded-md hover:bg-blue-600"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No flights found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlightBooking;
