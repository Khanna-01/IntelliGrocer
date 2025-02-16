import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "../styles/CustomerDashboard.css";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const CustomerDashboard = () => {
  const [username, setUsername] = useState("Guest");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/");
  };

  // Forged static customer data with the provided product image for all items
  const productImage =
    "https://www.foodandwine.com/thmb/UjbhFqVkAzxBG93P7POOj64ZxXQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/trader-joes-chef-grocery-list-FT-BLOG0319-bd54957ac64f4fb9a0f97e51e443f5e5.jpg";

  const customerData = {
    name: username,
    orderHistory: [
      { id: 1, item: "Product A", date: "2025-01-01" },
      { id: 2, item: "Product B", date: "2025-01-15" },
    ],
    recommendations: [
      {
        id: 1,
        name: "Product X",
        image: productImage,
        description: "Amazing product X",
      },
      {
        id: 2,
        name: "Product Y",
        image: productImage,
        description: "Incredible product Y",
      },
      {
        id: 3,
        name: "Product Z",
        image: productImage,
        description: "Stylish product Z",
      },
      {
        id: 4,
        name: "Product W",
        image: productImage,
        description: "Reliable product W",
      },
      {
        id: 5,
        name: "Product V",
        image: productImage,
        description: "Extra product V",
      },
      {
        id: 6,
        name: "Product U",
        image: productImage,
        description: "Extra product U",
      },
    ],
  };

  // Slider settings: 2 items per slide on desktop, 1 item on mobile.
  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 2,
    responsive: [
      {
        breakpoint: 768, // For smaller screens
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div>
      {/* Custom Sidebar */}
      <div className="sidebar">
        <div className="sidebar-title">My Dashboard</div>
        <ul className="sidebar-menu">
          <li>Home</li>
          <li>Products</li>
          <li>Orders</li>
          <li>Account</li>
          <li onClick={handleLogout}>Logout</li>
        </ul>
      </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-content">
        <div className="welcome-text">
          <h1>Welcome, {customerData.name}!</h1>
        </div>

        <section id="orders">
          <h2>Your Order History</h2>
          <ul>
            {customerData.orderHistory.map((order) => (
              <li key={order.id}>
                {order.item} – {order.date}
              </li>
            ))}
          </ul>
        </section>

        {/* Horizontal Card Slider for Featured Products */}
        <section id="slider">
          <h2>Featured Products</h2>
          <Slider {...sliderSettings}>
            {customerData.recommendations.map((product) => (
              <div key={product.id} className="slider-item">
                <img src={product.image} alt={product.name} />
                <p>{product.name}</p>
              </div>
            ))}
          </Slider>
        </section>

        {/* Grid for Recommended Products */}
        <section id="products">
          <h2>Recommended for You</h2>
          <div className="product-grid">
            {customerData.recommendations.map((product) => (
              <div key={product.id} className="product-card">
                <img src={product.image} alt={product.name} />
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <button>View Product</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CustomerDashboard;
