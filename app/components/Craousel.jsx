"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Carousel = () => {
  // Mock data as per system requirements
  const products = [
    {
      id: 1,
      name: "DSLR Camera",
      price: "500",
      img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500",
    },
    {
      id: 2,
      name: "Camping Tent",
      price: "300",
      img: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500",
    },
    {
      id: 3,
      name: "Projector",
      price: "800",
      img: "https://images.unsplash.com/photo-1535016120720-40c646be8960?w=500",
    },
    {
      id: 4,
      name: "Mountain Bike",
      price: "450",
      img: "https://images.unsplash.com/photo-1485965127454-408e33a7b1bd?w=500",
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center italic">
        Featured Rentables
      </h2>

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={25}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="pb-12"
      >
        {products.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 transition hover:scale-105 duration-300">
              <div className="h-56 overflow-hidden relative">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Available
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {item.name}
                </h3>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-blue-600 font-extrabold text-lg">
                    ₹{item.price}
                    <small className="text-slate-400 font-normal">/day</small>
                  </span>
                </div>

                <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors">
                  Rent Now
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Carousel;
