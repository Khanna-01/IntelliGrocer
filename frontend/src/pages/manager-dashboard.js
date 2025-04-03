import React, { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from "chart.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NotificationBell from "../components/NotificationBell"; 
import "../styles/ManagerDashboard.css";

// ✅ Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const ManagerDashboard = () => {
  const [salesData, setSalesData] = useState(null);
  const [pricingData, setPricingData] = useState(null);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [employees, setEmployees] = useState([]); 
  const [newItem, setNewItem] = useState({ name: "", description: "", price: 0, quantity: 0, image: "" });
  const [editingItem, setEditingItem] = useState({
    name: "",
    description: "",
    price: 0,
    basePrice: 0,
    quantity: 0,
    image: "",
  });
  const [schedule, setSchedule] = useState([]); 
  const [scheduleData, setScheduleData] = useState({ employeeId: "", shiftStart: "", shiftEnd: "", notes: "" });
  const [activeSection, setActiveSection] = useState("dashboard");
  const [username, setUsername] = useState(localStorage.getItem("username") || "User");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [tasks, setTasks] = useState([]);  

  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const managerId = localStorage.getItem("userId");
  
  const fetchInventory = async () => {
    try {
        const response = await axios.get("http://localhost:5001/api/inventory");
        console.log(" Inventory fetched:", response.data);
        setInventory(response.data || []);
    } catch (error) {
        console.error(" Error fetching inventory:", error);
    }
};
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesRes, pricingRes, inventoryRes, employeeCountRes, employeesRes, scheduleRes, tasksRes] = await Promise.all([
          axios.get("http://localhost:5001/api/sales/analytics"),
          axios.get("http://localhost:5001/api/pricing/dynamic"),
          axios.get("http://localhost:5001/api/inventory"),
          axios.get("http://localhost:5001/api/employees/count"),
          axios.get("http://localhost:5001/api/employees"),
          axios.get("http://localhost:5001/api/schedule"),
          axios.get("http://localhost:5001/api/tasks"),
        ]);

        setSalesData(salesRes.data);
        setPricingData(pricingRes.data);
        setInventory(inventoryRes.data);
        setEmployeeCount(employeeCountRes.data.count || 0);
        setEmployees(Array.isArray(employeesRes.data) ? employeesRes.data : []);
        setSchedule(scheduleRes.data);
        setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);

      } catch (error) {
        console.error(" Error fetching data:", error);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        
        const countRes = await axios.get("http://localhost:5001/api/employees/count");
        setEmployeeCount(countRes.data.count);

        
        const employeesRes = await axios.get("http://localhost:5001/api/employees");
        setEmployees(employeesRes.data);
      } catch (error) {
        console.error(" Error fetching employees:", error);
      }
    };

   
    fetchInventory();  
    fetchEmployees();
    

  }, []);


  useEffect(() => {
    axios.get("http://localhost:5001/api/sales/analytics")
      .then(response => {
        console.log(" Fetched Sales Data:", response.data);
        if (response.data && Array.isArray(response.data.dates)) {
          setSalesData(response.data);
        } else {
          console.error(" Sales data is not in expected format:", response.data);
          setSalesData({ dates: [], revenues: [] });
        }
      })
      .catch(error => {
        console.error(" Error fetching sales data:", error);
      });
  }, []); 

  const approvePrice = (itemId, newPrice) => {
    axios.post(`http://localhost:5001/api/inventory/approve-price/${itemId}`, { newPrice })
      .then(res => {
        console.log("Price approved:", res.data);
  
        
        axios.get("http://localhost:5001/api/inventory")
          .then(response => {
            setInventory(response.data); 
            console.log(" Updated inventory after price approval:", response.data);
          })
          .catch(fetchError => console.error(" Error fetching updated inventory:", fetchError));
      })
      .catch(err => console.error(" Error approving price:", err.response?.data || err.message));
  };
  
  const assignTask = (e) => {
    e.preventDefault();
  
    if (!title || !description || !assignedTo) {
      alert("Please fill in all task details.");
      return;
    }
  
    axios.post("http://localhost:5001/api/tasks", { title, description, assignedTo })
      .then(() => {
        alert("Task assigned successfully!");
        setTitle(""); 
        setDescription(""); 
        setAssignedTo(""); 
      })
      .catch((err) => console.error("Error assigning task:", err));
  };
  

  const markAsCompleted = (taskId) => {
    axios.patch(`http://localhost:5001/api/tasks/${taskId}`, { status: "Completed" })
      .then(() => setTasks(prevTasks =>
        prevTasks.map(task => task._id === taskId ? { ...task, status: "Completed" } : task)
      ))
      .catch(err => console.error("Error updating task:", err));
  };

  
  

  const handleAddItem = async () => {
    if (
        !newItem.name.trim() || 
        !newItem.description.trim() || 
        newItem.basePrice === "" || 
        newItem.stockLevel === "" || 
        !newItem.image.trim()
    ) {
        alert("Please fill out all fields before adding an item.");
        return;
    }

    console.log("📢 Sending New Item Data:", newItem);

    try {
        const res = await axios.post(
            "http://localhost:5001/api/inventory",
            {
                name: newItem.name,
                description: newItem.description,
                basePrice: Number(newItem.basePrice),  // Ensure Number format
                stockLevel: Number(newItem.stockLevel),  // Ensure Number format
                image: newItem.image,
            },
            { 
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log(" Item added successfully:", res.data);

        
        await fetchInventory();

        
        setNewItem({ name: "", description: "", basePrice: "", stockLevel: "", image: "" });

    } catch (error) {
        console.error(" Error adding item:", error.response?.data || error.message);
        alert("Error adding item: " + (error.response?.data?.error || "Check required fields"));
    }
};

const handleUpdateItem = async () => {
  if (!editingItem || !editingItem._id) {
    console.error(" Invalid item ID:", editingItem);
    return;
  }

  try {
    await axios.put(`http://localhost:5001/api/inventory/${editingItem._id}`,
      {
        name: editingItem.name,
        description: editingItem.description,
        basePrice: Number(editingItem.basePrice),
        stockLevel: Number(editingItem.stockLevel),
        image: editingItem.image,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    await fetchInventory();
    setEditingItem(null);
  } catch (error) {
    console.error(" Error updating item:", error.response?.data || error.message);
  }
};

  const handleDeleteItem = (id) => {
    axios.delete(`http://localhost:5001/api/inventory/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => setInventory(inventory.filter(item => item._id !== id)))
      .catch(err => console.error("Error deleting item:", err));
  };

  const handleAddSchedule = () => {
    console.log("📢 Sending schedule request:", scheduleData); 
  
    axios.post("http://localhost:5001/api/schedule", scheduleData, { headers: { Authorization: `Bearer ${token}` } })
      .then(response => {
        console.log("Schedule API Response:", response.data);
        setSchedule([...schedule, response.data.newSchedule]); 
        
      })
      .catch(error => {
        console.error(" Error creating schedule:", error.response ? error.response.data : error);
        alert("Error creating schedule: " + (error.response?.data?.error || "Unknown error"));
      });
  };

  const saveSchedule = () => {
    axios.post("http://localhost:5001/api/schedule", schedule, { headers: { Authorization: `Bearer ${token}` } })
      .then(response => console.log("Schedule saved:", response.data))
      .catch(error => console.error("Error saving schedule:", error));
  };

  const salesChartData = {
    labels: salesData && Array.isArray(salesData.dates) ? salesData.dates : [],
    datasets: [
      {
        label: "Daily Sales Revenue",
        data: salesData && Array.isArray(salesData.revenues) ? salesData.revenues : [],
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
          <li className={`nav-item ${activeSection === "schedule" ? "active" : ""}`} onClick={() => setActiveSection("schedule")}>Schedule</li>
          <li className={`nav-item ${activeSection === "tasks" ? "active" : ""}`} onClick={() => setActiveSection("tasks")}>Manage Tasks</li>
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <p className="welcome-text">Welcome, {username}!</p>
  <NotificationBell userId={managerId} />
</div>
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
            <input placeholder="Name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
            <input placeholder="Description" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
            
            <input type="number" placeholder="Base Price" 
  value={newItem.basePrice} 
  onChange={(e) => setNewItem({ ...newItem, basePrice: e.target.value })} 
/>
<input 
  type="number" 
  placeholder="Stock Level" 
  value={editingItem?.stockLevel ?? ""} 
  onChange={(e) => setEditingItem({ ...editingItem, stockLevel: e.target.value })} 
/>
            <input type="text" placeholder="Image URL" value={newItem.image} onChange={(e) => setNewItem({ ...newItem, image: e.target.value })} />
            <button onClick={handleAddItem}>Add Item</button>
            
            {editingItem && (
              <div>
                <h3>Edit Item</h3>
                <input placeholder="Name" value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} />
                <input placeholder="Description" value={editingItem.description} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} />
                
                <input
  type="number"
  placeholder="Base Price"
  value={editingItem?.basePrice || 0}
  onChange={(e) => setEditingItem({ ...editingItem, basePrice: e.target.value })}
/>
<input 
  type="number" 
  placeholder="Stock Level" 
  value={editingItem?.stockLevel ?? ""} 
  onChange={(e) => setEditingItem({ ...editingItem, stockLevel: e.target.value })} 
/>
                <input type="text" placeholder="Image URL" value={editingItem.image} onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })} />
                <button onClick={handleUpdateItem}>Update Item</button>
                <button onClick={() => setEditingItem(null)}>Cancel</button>
              </div>
            )}
            
            <ul>
            {}
            <ul>
  {inventory.map((item) => (
    <li key={item._id}>
      <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px' }} />
      {item.name} - ${item.basePrice} - {item.stockLevel} in stock
      <button onClick={() => setEditingItem({ ...item, basePrice: item.basePrice || 0 })}>Edit</button>
      <button onClick={() => handleDeleteItem(item._id)}>Delete</button>
    </li>
  ))}
</ul>
            </ul>
          </div>
        )}
        {activeSection === "schedule" && (
  <div className="dashboard-card">
    <h2>Schedule Employees</h2>
    <select onChange={(e) => setScheduleData({ ...scheduleData, employeeId: e.target.value })}>
  <option value="">Select Employee</option>
  {employees.map(employee => (
    <option key={employee._id} value={employee._id}>{employee.username}</option>
  ))}
</select>
    <input type="datetime-local" onChange={(e) => setScheduleData({ ...scheduleData, shiftStart: e.target.value })} />
    <input type="datetime-local" onChange={(e) => setScheduleData({ ...scheduleData, shiftEnd: e.target.value })} />
    <input type="text" placeholder="Notes (Optional)" onChange={(e) => setScheduleData({ ...scheduleData, notes: e.target.value })} />
    <button onClick={() => {
  if (!scheduleData.employeeId || !scheduleData.shiftStart || !scheduleData.shiftEnd) {
    alert("Please fill out all required fields.");
    return;
  }
  
  console.log("Sending schedule request:", scheduleData); 

  axios.post("http://localhost:5001/api/schedule", scheduleData, { headers: { Authorization: `Bearer ${token}` } })
    .then(response => {
      console.log("Schedule assigned successfully:", response.data);
      setSchedule([...schedule, response.data.newSchedule]); 
      alert("Shift assigned successfully!");
    })
    .catch(error => {
      console.error("Error creating schedule:", error.response?.data || error);
      alert("Error creating schedule: " + (error.response?.data?.error || "Unknown error"));
    });
}}>Assign Shift</button>
  </div>
)}
{activeSection === "tasks" && (
          <div className="dashboard-card">
            <h2>Task Management</h2>

            {/*  Assign New Task */}
            <div className="assign-task-form">
              <h3>Assign a Task</h3>
              <input type="text" placeholder="Task Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <textarea placeholder="Task Description" value={description} onChange={(e) => setDescription(e.target.value)} />
              <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                <option value="">Select Employee</option>
                {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.username}</option>)}
              </select>
              <button onClick={assignTask}>Assign Task</button>
            </div>

            
            <div className="task-list">
              <h3>Assigned Tasks</h3>
              {tasks.length > 0 ? (
                <ul>
                  {tasks.map((task) => (
                    <li key={task._id}>
                      <strong>{task.title}</strong> - {task.description} <br />
                      Status: {task.status}
                      {task.status !== "Completed"}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No assigned tasks.</p>
              )}
            </div>
          </div>
        )}

{activeSection === "pricing" && (
  <div className="dashboard-card shadow-effect">
    <h2>Dynamic Pricing Overview</h2>
    {pricingData && pricingData.length > 0 ? (
  <Bar
    data={{
      labels: pricingData.map((p) => p?.name || "Unnamed Product"), 
      datasets: [
        {
          label: "Current Price",
          data: pricingData.map((p) => parseFloat(p?.currentPrice) || 0), 
          backgroundColor: "rgba(153,102,255,0.6)",
        },
        {
          label: "Suggested Price",
          data: pricingData.map((p) => parseFloat(p?.suggestedPrice) || 0), 
          backgroundColor: "rgba(255,159,64,0.6)",
        },
      ],
    }}
  />
) : (
  <p>No pricing data available</p>
)}
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
