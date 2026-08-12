import React, { useState, useEffect } from "react";
import { FaStar, FaQuoteLeft, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion } from "framer-motion";

const reviews = [
  { 
    name: "Rivu Basak", 
    review: "Amazing experience! Very easy to book flights. The interface is intuitive and saved me so much time compared to other platforms.", 
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    date: "2 days ago"
  },
  { 
    name: "Talha Khan", 
    review: "I love the cab booking feature, saved a lot of time! The drivers were punctual and the pricing was transparent.", 
    rating: 4,
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    date: "1 week ago"
  },
  { 
    name: "Rahul Singh", 
    review: "Super fast and smooth train booking system! Got my tickets confirmed instantly and the app notifications kept me updated.", 
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/42.jpg",
    date: "3 days ago"
  },
  { 
    name: "Sneha Das", 
    review: "Great service, had no issues while booking my bus ticket. The seat selection feature is particularly useful.", 
    rating: 4,
    avatar: "https://randomuser.me/api/portraits/women/63.jpg",
    date: "5 days ago"
  },
  { 
    name: "Vikram Patel", 
    review: "The customer support was really helpful and quick! They resolved my booking issue within minutes.", 
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    date: "2 weeks ago"
  },
  { 
    name: "Alisha Roy", 
    review: "Loved the discount feature, got a great deal on my hotel booking! Will definitely use this service again for my next trip.", 
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    date: "1 month ago"
  },
  { 
    name: "Priya Sharma", 
    review: "The package deals are fantastic! Booked my entire vacation through this platform and everything went smoothly.", 
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    date: "3 weeks ago"
  },
  { 
    name: "Arjun Mehta", 
    review: "Impressed with the real-time tracking feature for buses. Never had to worry about delays.", 
    rating: 4,
    avatar: "https://randomuser.me/api/portraits/men/51.jpg",
    date: "4 days ago"
  }
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(2);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 768 ? 1 : 2);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalPages = Math.ceil(reviews.length / itemsPerPage);

  // Reset index if it exceeds totalPages due to resize
  useEffect(() => {
    if (currentIndex >= totalPages && totalPages > 0) {
      setCurrentIndex(totalPages - 1);
    }
  }, [totalPages, currentIndex]);

  // Auto-rotate testimonials
  useEffect(() => {
    let interval;
    if (isAutoPlaying && totalPages > 0) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % totalPages);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, totalPages]);

  const nextTestimonial = () => {
    if (totalPages > 0) {
      setCurrentIndex((prev) => (prev + 1) % totalPages);
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 10000);
    }
  };

  const prevTestimonial = () => {
    if (totalPages > 0) {
      setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 10000);
    }
  };

  // Display testimonials dynamically based on screen size
  const visibleReviews = reviews.slice(currentIndex * itemsPerPage, currentIndex * itemsPerPage + itemsPerPage);

  return (
    <section className="relative py-16 overflow-hidden bg-[#ebebeb]">
      <div className="absolute inset-0 pointer-events-none opacity-45">
        <div className="absolute top-12 left-[-6rem] h-64 w-64 rounded-full bg-slate-100 blur-3xl" />
        <div className="absolute -bottom-20 right-[-5rem] h-72 w-72 rounded-full bg-blue-50 blur-3xl" />
      </div>

      <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="flex justify-center mb-3 text-slate-900" aria-label="Testimonials">
            <svg width="996" height="47" viewBox="0 0 996 47" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-auto w-full max-w-[720px]">
            <path d="M29.76 45.824V15.872H9.53674e-07V1.024H79.36V15.872H49.6V45.824H29.76ZM84.002 45.824V1.024H163.362V13.952H103.842V17.92H156.45V28.928H103.842V32.896H163.362V45.824H84.002ZM210.525 46.848C205.319 46.848 200.071 46.5067 194.781 45.824C189.49 45.184 184.434 44.3307 179.613 43.264C174.791 42.1547 170.503 40.96 166.749 39.68L172.701 29.248C179.869 31.936 186.695 33.6853 193.181 34.496C199.709 35.264 205.959 35.648 211.933 35.648C216.37 35.648 219.719 35.4773 221.981 35.136C224.242 34.752 225.373 34.1547 225.373 33.344C225.373 32.6187 224.541 32.1067 222.877 31.808C221.255 31.5093 219.058 31.3387 216.285 31.296C213.511 31.2107 210.418 31.1253 207.005 31.04C203.634 30.9547 200.135 30.8053 196.509 30.592C192.925 30.3787 189.447 29.9947 186.077 29.44C182.706 28.8427 179.677 27.9893 176.989 26.88C174.301 25.7707 172.146 24.2987 170.525 22.464C168.946 20.6293 168.157 18.3253 168.157 15.552C168.157 12.6507 169.053 10.1973 170.845 8.19201C172.679 6.18667 175.175 4.58667 178.333 3.392C181.49 2.19734 185.095 1.344 189.149 0.832005C193.245 0.277337 197.533 3.8147e-06 202.013 3.8147e-06C206.023 3.8147e-06 210.055 0.192004 214.109 0.576004C218.205 0.917336 222.173 1.408 226.013 2.048C229.853 2.64534 233.415 3.34934 236.701 4.16C239.986 4.97067 242.802 5.824 245.149 6.72001L239.197 17.152C235.57 15.872 231.559 14.8053 227.165 13.952C222.813 13.056 218.29 12.3947 213.597 11.968C208.903 11.4987 204.253 11.264 199.645 11.264C192.519 11.264 188.957 12.0107 188.957 13.504C188.957 14.1867 189.789 14.6773 191.453 14.976C193.117 15.2747 195.335 15.4667 198.109 15.552C200.925 15.5947 204.018 15.6587 207.389 15.744C210.717 15.8293 214.173 15.9787 217.757 16.192C221.383 16.4053 224.861 16.7893 228.189 17.344C231.559 17.8987 234.589 18.7307 237.277 19.84C240.007 20.9067 242.162 22.336 243.741 24.128C245.319 25.92 246.109 28.16 246.109 30.848C246.109 33.792 245.127 36.288 243.165 38.336C241.245 40.384 238.621 42.048 235.293 43.328C231.965 44.5653 228.167 45.4613 223.901 46.016C219.634 46.5707 215.175 46.848 210.525 46.848ZM277.26 45.824V15.872H247.5V1.024H326.86V15.872H297.1V45.824H277.26ZM330.542 45.824V30.976H360.302V15.872H330.542V1.024H409.902V15.872H380.142V30.976H409.902V45.824H330.542ZM416.377 45.824V1.024H446.009L456.057 20.416L466.105 1.024H495.737V45.824H476.537V18.304L476.473 18.496L462.265 45.824H449.849L435.641 18.496L435.577 18.304V45.824H416.377ZM540.572 46.848C532.465 46.848 525.425 45.9307 519.452 44.096C513.521 42.2187 508.934 39.552 505.692 36.096C502.492 32.64 500.892 28.544 500.892 23.808V23.04C500.892 18.2613 502.492 14.1653 505.692 10.752C508.934 7.296 513.521 4.65067 519.452 2.816C525.425 0.93867 532.465 3.8147e-06 540.572 3.8147e-06C548.721 3.8147e-06 555.761 0.93867 561.692 2.816C567.622 4.65067 572.188 7.296 575.388 10.752C578.63 14.1653 580.252 18.2613 580.252 23.04V23.808C580.252 28.544 578.63 32.64 575.388 36.096C572.188 39.552 567.622 42.2187 561.692 44.096C555.761 45.9307 548.721 46.848 540.572 46.848ZM540.572 32.128C546.417 32.128 551.025 31.4027 554.396 29.952C557.809 28.4587 559.516 26.4107 559.516 23.808V23.04C559.516 20.4373 557.809 18.4107 554.396 16.96C551.025 15.4667 546.417 14.72 540.572 14.72C534.769 14.72 530.161 15.4667 526.748 16.96C523.334 18.4107 521.628 20.4373 521.628 23.04V23.808C521.628 26.4107 523.334 28.4587 526.748 29.952C530.161 31.4027 534.769 32.128 540.572 32.128ZM585.377 45.824V1.024H604.961L644.897 25.728V1.024H664.737V45.824H645.153L605.217 21.12V45.824H585.377ZM671.23 45.824V30.976H700.99V15.872H671.23V1.024H750.59V15.872H720.83V30.976H750.59V45.824H671.23ZM752.594 45.824L780.562 1.024H804.05L831.954 45.824H810.642L806.802 38.848H777.938L773.906 45.824H752.594ZM786.45 24L784.274 27.84H800.722L798.61 24L793.298 13.12H792.018L786.45 24ZM835.252 45.824V1.024H855.092V30.976H914.612V45.824H835.252ZM959.9 46.848C954.694 46.848 949.446 46.5067 944.156 45.824C938.865 45.184 933.809 44.3307 928.988 43.264C924.166 42.1547 919.878 40.96 916.124 39.68L922.076 29.248C929.244 31.936 936.07 33.6853 942.556 34.496C949.084 35.264 955.334 35.648 961.308 35.648C965.745 35.648 969.094 35.4773 971.356 35.136C973.617 34.752 974.748 34.1547 974.748 33.344C974.748 32.6187 973.916 32.1067 972.252 31.808C970.63 31.5093 968.433 31.3387 965.66 31.296C962.886 31.2107 959.793 31.1253 956.38 31.04C953.009 30.9547 949.51 30.8053 945.884 30.592C942.3 30.3787 938.822 29.9947 935.452 29.44C932.081 28.8427 929.052 27.9893 926.364 26.88C923.676 25.7707 921.521 24.2987 919.9 22.464C918.321 20.6293 917.532 18.3253 917.532 15.552C917.532 12.6507 918.428 10.1973 920.22 8.19201C922.054 6.18667 924.55 4.58667 927.708 3.392C930.865 2.19734 934.47 1.344 938.524 0.832005C942.62 0.277337 946.908 3.8147e-06 951.388 3.8147e-06C955.398 3.8147e-06 959.43 0.192004 963.484 0.576004C967.58 0.917336 971.548 1.408 975.388 2.048C979.228 2.64534 982.79 3.34934 986.076 4.16C989.361 4.97067 992.177 5.824 994.524 6.72001L988.572 17.152C984.945 15.872 980.934 14.8053 976.54 13.952C972.188 13.056 967.665 12.3947 962.972 11.968C958.278 11.4987 953.628 11.264 949.02 11.264C941.894 11.264 938.332 12.0107 938.332 13.504C938.332 14.1867 939.164 14.6773 940.828 14.976C942.492 15.2747 944.71 15.4667 947.484 15.552C950.3 15.5947 953.393 15.6587 956.764 15.744C960.092 15.8293 963.548 15.9787 967.132 16.192C970.758 16.4053 974.236 16.7893 977.564 17.344C980.934 17.8987 983.964 18.7307 986.652 19.84C989.382 20.9067 991.537 22.336 993.116 24.128C994.694 25.92 995.484 28.16 995.484 30.848C995.484 33.792 994.502 36.288 992.54 38.336C990.62 40.384 987.996 42.048 984.668 43.328C981.34 44.5653 977.542 45.4613 973.276 46.016C969.009 46.5707 964.55 46.848 959.9 46.848Z" fill="black" fill-opacity="0.8"/>
            </svg>
          </h2>
          <p className="max-w-2xl mx-auto text-xl font-normal text-slate-600">
            Hear from our community of happy travelers about their experiences
          </p>
        </motion.div>

        <div className="relative px-10 md:px-12">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="flex flex-col md:flex-row justify-center items-center md:items-stretch gap-6 md:gap-8"
          >
            {visibleReviews.map(({ name, review, rating, avatar, date }, index) => (
              <motion.div
                key={`${name}-${index}`}
                initial={{ opacity: 0, y: 28, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-blue-50 p-6 md:p-8 shadow-[0_18px_45px_rgba(15,23,42,0.10)] backdrop-blur-sm transition-all duration-300"
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
              >
                <div className="pointer-events-none absolute inset-0 opacity-75 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.35)_35%,rgba(255,255,255,0)_75%)]" />
                <div className="relative flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center mb-4">
                      <img 
                        src={avatar} 
                        alt={name} 
                        className="object-cover w-12 h-12 border-2 rounded-full border-slate-200"
                      />
                      <div className="ml-4 text-left">
                        <h4 className="text-xl font-semibold leading-none text-slate-900">{name}</h4>
                        <p className="mt-1 text-base font-normal text-slate-500">{date}</p>
                      </div>
                    </div>
                    
                    <div className="flex mb-4 text-yellow-400">
                      {Array(rating).fill().map((_, i) => (
                        <FaStar key={i} className="text-lg" />
                      ))}
                    </div>
                    
                    <div className="relative">
                      <FaQuoteLeft className="absolute left-0 text-2xl -top-2 text-slate-200" />
                      <p className="pl-8 text-base md:text-lg italic font-normal leading-relaxed text-slate-700">"{review}"</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 mt-6 border-t border-slate-200">
                    <span className="text-base font-normal text-slate-500">
                      Verified Traveler
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-3 shadow-md transition-all hover:bg-slate-50 z-10"
            aria-label="Previous testimonial"
          >
            <FaChevronLeft className="text-blue-400" />
          </button>
          
          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-3 shadow-md transition-all hover:bg-slate-50 z-10"
            aria-label="Next testimonial"
          >
            <FaChevronRight className="text-blue-400" />
          </button>
        </div>

        <div className="flex justify-center mt-8 space-x-2">
          {Array(totalPages).fill().map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentIndex(i);
                setIsAutoPlaying(false);
                setTimeout(() => setIsAutoPlaying(true), 10000);
              }}
              className={`h-3.5 w-3.5 rounded-full transition-all ${i === currentIndex ? 'bg-blue-400 scale-110' : 'bg-slate-300 hover:bg-slate-400'}`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;