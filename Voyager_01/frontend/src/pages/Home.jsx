import React from "react";
import Hero from "../components/Exclusive/Hero/Hero";
import Destinations from "../components/Exclusive/Hero/Destinations";
import MapPage from "./MapPage";
import Community from "../pages/Community";
import Testimonials from "../components/Testimonials";

const Home = () => {
  return (
    <div className="px-0 bg-[#ebebeb]">
      <Hero />
      <Destinations />
      <Community/>
      <MapPage/>
      <Testimonials />
    </div>
  );
};
export default Home;
