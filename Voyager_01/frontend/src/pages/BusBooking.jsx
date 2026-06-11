"use client";

import { useState } from "react";
import { FaBus, FaChair } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";

const buses = [
  {
    id: 1,
    name: "Volvo Express",
    source: "Delhi",
    destination: "Jaipur",
    departure: "08:00 AM",
    arrival: "12:00 PM",
    duration: "4h",
    price: 499,
    availableSeats: Array(30).fill(true),
  },
  {
    id: 2,
    name: "Rajdhani Travels",
    source: "Delhi",
    destination: "Agra",
    departure: "09:30 AM",
    arrival: "01:00 PM",
    duration: "3.5h",
    price: 399,
    availableSeats: Array(30).fill(true),
  },
  {
    id: 3,
    name: "Himachal Roadways",
    source: "Shimla",
    destination: "Manali",
    departure: "07:00 AM",
    arrival: "02:00 PM",
    duration: "7h",
    price: 599,
    availableSeats: Array(30).fill(true),
  },
];

export default function BusBooking() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);

  const filteredBuses = buses.filter(
    (bus) =>
      bus.source.toLowerCase().includes(source.toLowerCase()) &&
      bus.destination.toLowerCase().includes(destination.toLowerCase())
  );

  const toggleSeat = (index) => {
    if (selectedSeats.includes(index)) {
      setSelectedSeats(selectedSeats.filter((i) => i !== index));
    } else {
      setSelectedSeats([...selectedSeats, index]);
    }
  };

  return (
    <div className="bg-[#ebebe] min-h-screen p-6 pt-28">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-800">Bus Booking Portal</h1>
          <p className="text-gray-600">Search, select seats, and reserve your ride!</p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
          <input
            type="text"
            placeholder="Source"
            className="w-64 p-2 border rounded-md"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
          <input
            type="text"
            placeholder="Destination"
            className="w-64 p-2 border rounded-md"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>

        {!selectedBus ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Available Buses</h2>
            {filteredBuses.map((bus) => (
              <div
                key={bus.id}
                className="flex flex-col items-center justify-between p-4 transition bg-white rounded-lg shadow md:flex-row hover:shadow-lg"
              >
                <div className="flex-1 space-y-1">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-blue-700">
                    <FaBus /> {bus.name}
                  </h3>
                  <p className="text-gray-600">
                    {bus.source} → {bus.destination} ({bus.duration})
                  </p>
                  <p className="text-sm text-gray-500">
                    Departs at {bus.departure} | Arrives by {bus.arrival}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-xl font-bold text-blue-800">₹{bus.price}</p>
                  <button
                    onClick={() => {
                      setSelectedBus(bus);
                      setSelectedSeats([]);
                    }}
                    className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                  >
                    Select Seats
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 space-y-6 bg-white rounded-lg shadow-md">
            <button
              className="text-blue-600 hover:underline"
              onClick={() => setSelectedBus(null)}
            >
              ← Back to bus list
            </button>

            <h2 className="text-2xl font-bold">Select Your Seats</h2>

            <div className="grid w-full max-w-md grid-cols-5 gap-4 p-4 mx-auto bg-gray-100 border rounded-md">
              {selectedBus.availableSeats.map((_, index) => (
                <button
                  key={index}
                  onClick={() => toggleSeat(index)}
                  className={`p-2 rounded border text-sm flex items-center justify-center transition-colors duration-200
                    ${selectedSeats.includes(index) ? "bg-green-500 text-white" : "bg-white hover:bg-blue-100"}`}
                >
                  <FaChair /> {index + 1}
                </button>
              ))}
            </div>

            <div className="mt-6 text-center">
              <h3 className="mb-2 text-lg font-semibold">Total Price: ₹{selectedSeats.length * selectedBus.price}</h3>
              <button
                className="px-6 py-2 text-white bg-blue-700 rounded hover:bg-blue-800"
                onClick={() => alert("Booking Confirmed!\nSeats: " + selectedSeats.map(i => i + 1).join(", "))}
              >
                Confirm Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}