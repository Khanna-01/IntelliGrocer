import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/EmployeeDashboard.css"; // Make sure to create this CSS file for styling

const EmployeeDashboard = () => {
  const [username, setUsername] = useState(localStorage.getItem("username") || "Employee");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [tasks, setTasks] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/api/tasks")
      .then(response => setTasks(response.data || [])) // ✅ Ensure it's an array
      .catch(error => console.error("Error fetching tasks:", error));

    axios.get("http://localhost:5000/api/inventory/low-stock")
      .then(response => setLowStockItems(response.data || [])) // ✅ Ensure it's an array
      .catch(error => console.error("Error fetching low stock items:", error));
  }, []);

  return (
    <div className="employee-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="sidebar-title">IntelliGrocer</h2>
        <ul className="sidebar-menu">
          <li
            className={`nav-item ${activeSection === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveSection("dashboard")}
          >
            Dashboard
          </li>
          <li
            className={`nav-item ${activeSection === "tasks" ? "active" : ""}`}
            onClick={() => setActiveSection("tasks")}
          >
            Tasks
          </li>
          <li
            className={`nav-item ${activeSection === "inventory" ? "active" : ""}`}
            onClick={() => setActiveSection("inventory")}
          >
            Inventory
          </li>
          <li
            className="nav-item logout"
            onClick={() => {
              localStorage.removeItem("role");
              localStorage.removeItem("username");
              navigate("/");
            }}
          >
            Logout
          </li>
        </ul>
      </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-content">
        {/* Dashboard Section */}
        {activeSection === "dashboard" && (
          <>
            <h2 className="dashboard-title">Employee Dashboard</h2>
            <p className="welcome-text">Welcome, {username}!</p>

            <div className="dashboard-grid">
              <div className="dashboard-card shadow-effect">
                <h3>Performance Metrics</h3>
                <p>Efficiency: 95%</p>
              </div>
              <div className="dashboard-card shadow-effect">
                <h3>Pending Tasks</h3>
                <p>{tasks.length}</p>
              </div>
            </div>
          </>
        )}

        {/* Tasks Section */}
        {activeSection === "tasks" && (
          <div className="dashboard-card shadow-effect">
            <h2>Your Tasks</h2>
            {Array.isArray(tasks) && tasks.length > 0 ? (
              <ul>
                {tasks.map((task, index) => (
                  <li key={index}>
                    {task.description} - <strong>{task.status}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No assigned tasks.</p>
            )}
          </div>
        )}

        {/* Inventory Section */}
        {activeSection === "inventory" && (
          <div className="dashboard-card shadow-effect">
            <h2>Inventory Overview</h2>
            {Array.isArray(lowStockItems) && lowStockItems.length > 0 ? (
              <ul>
                {lowStockItems.map((item, index) => (
                  <li key={index}>
                    {item.name} - <strong>{item.stock} remaining</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p>All inventory is well stocked.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
