import React, { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from "chart.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ManagerDashboard.css";

// ✅ Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const ManagerDashboard = () => {
  const [salesData, setSalesData] = useState(null);
  const [pricingData, setPricingData] = useState(null);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [username, setUsername] = useState(localStorage.getItem("username") || "User");

  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/api/sales/analytics")
      .then(response => setSalesData(response.data))
      .catch(error => console.error("Error fetching sales data:", error));

    axios.get("http://localhost:5000/api/pricing/dynamic")
      .then(response => setPricingData(response.data))
      .catch(error => console.error("Error fetching pricing data:", error));

    axios.get("http://localhost:5000/api/inventory/alerts")
      .then(response => setInventoryAlerts(response.data || []))
      .catch(error => console.error("Error fetching inventory alerts:", error));

    axios.get("http://localhost:5000/api/employees/count")
      .then(response => setEmployeeCount(response.data.count || 0))
      .catch(error => console.error("Error fetching employee count:", error));
  }, []);

  const salesChartData = {
    labels: salesData ? salesData.dates : [],
    datasets: [
      {
        label: "Daily Sales Revenue",
        data: salesData ? salesData.revenues : [],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="manager-dashboard">
      <div className="sidebar">
        <h2 className="sidebar-title">IntelliGrocer</h2>
        <ul className="sidebar-menu">
          <li className={`nav-item ${activeSection === "dashboard" ? "active" : ""}`} onClick={() => setActiveSection("dashboard")}>Dashboard</li>
          <li className={`nav-item ${activeSection === "inventory" ? "active" : ""}`} onClick={() => setActiveSection("inventory")}>Inventory</li>
          <li className={`nav-item ${activeSection === "pricing" ? "active" : ""}`} onClick={() => setActiveSection("pricing")}>Pricing</li>
          <li className={`nav-item ${activeSection === "reports" ? "active" : ""}`} onClick={() => setActiveSection("reports")}>Reports</li>
          <li className="nav-item logout" onClick={() => {
            localStorage.removeItem("role");
            localStorage.removeItem("username");
            navigate("/");
          }}>Logout</li>
        </ul>
      </div>

      <div className="dashboard-content">
        {activeSection === "dashboard" && (
          <>
            <h2 className="dashboard-title">Manager Dashboard</h2>
            <p className="welcome-text">Welcome, {username}!</p>
            <div className="dashboard-grid">
              <div className="dashboard-card shadow-effect">
                <h3>Sales Analytics</h3>
                {salesData ? <Line data={salesChartData} /> : <p>Loading sales data...</p>}
              </div>
              <div className="dashboard-card shadow-effect">
                <h3>Employees Count</h3>
                <p>{employeeCount}</p>
              </div>
              <div className="dashboard-card shadow-effect">
                <h3>Low Stock Alerts</h3>
                <ul>
                  {Array.isArray(inventoryAlerts) && inventoryAlerts.length > 0 ? (
                    inventoryAlerts.map((alert, index) => (
                      <li key={index}>{alert.productName}: {alert.message}</li>
                    ))
                  ) : (
                    <p>No inventory alerts.</p>
                  )}
                </ul>
              </div>
            </div>
          </>
        )}

        {activeSection === "inventory" && (
          <div className="dashboard-card shadow-effect">
            <h2>Inventory Management</h2>
            <ul>
              {Array.isArray(inventoryAlerts) && inventoryAlerts.length > 0 ? (
                inventoryAlerts.map((alert, index) => (
                  <li key={index}>{alert.productName}: {alert.message}</li>
                ))
              ) : (
                <p>No inventory alerts.</p>
              )}
            </ul>
          </div>
        )}

        {activeSection === "pricing" && (
          <div className="dashboard-card shadow-effect">
            <h2>Dynamic Pricing Overview</h2>
            {pricingData ? <Bar data={{
              labels: pricingData.map(p => p.name),
              datasets: [
                { label: "Current Price", data: pricingData.map(p => p.currentPrice), backgroundColor: "rgba(153,102,255,0.6)" },
                { label: "Suggested Price", data: pricingData.map(p => p.suggestedPrice), backgroundColor: "rgba(255,159,64,0.6)" },
              ],
            }} /> : <p>Loading pricing data...</p>}
          </div>
        )}

        {activeSection === "reports" && (
          <div className="dashboard-card shadow-effect">
            <h2>Sales Analysis</h2>
            {salesData ? <Line data={salesChartData} /> : <p>Loading sales data...</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
