import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/NotificationBell.css";

const NotificationBell = ({ userId: propUserId }) => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const userId = propUserId || localStorage.getItem("userId");

  const fetchNotifications = async () => {
    if (!userId || userId === "undefined" || userId === "null") return;

    try {
      const res = await axios.get(`http://localhost:5001/api/notifications/${userId}`);
      setNotifications(res.data);
    } catch (err) {
      console.error(" Error fetching notifications:", err);
    }
  };

  const handleBellClick = async () => {
    const willShow = !showDropdown;
    setShowDropdown(willShow);

    if (willShow && notifications.some((n) => !n.isRead)) {
      try {
        await axios.patch(`http://localhost:5001/api/notifications/mark-read/${userId}`);
        console.log(" Notifications marked as read");

        
        const updated = notifications.map((n) => ({ ...n, isRead: true }));
        setNotifications(updated);
      } catch (err) {
        console.error(" Error marking notifications as read:", err);
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="notification-bell-container">
      <div
        className="bell-icon"
        onClick={handleBellClick}
        style={{ cursor: "pointer", position: "relative" }}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-count">{unreadCount}</span>
        )}
      </div>

      {showDropdown && (
        <div className="notification-dropdown">
        {notifications.length > 0 ? (
  <>
    <ul>
      {notifications.map((notif, index) => (
        <li
          key={index}
          style={{
            fontWeight: notif.isRead ? "normal" : "bold",
            opacity: notif.isRead ? 0.6 : 1,
          }}
        >
          {notif.message}
        </li>
      ))}
    </ul>
    <button
      className="clear-button"
      onClick={async () => {
        try {
          await axios.delete(`http://localhost:5001/api/notifications/clear/${userId}`);
          setNotifications([]);
          console.log(" Notifications cleared");
        } catch (err) {
          console.error("Failed to clear notifications:", err);
        }
      }}
    >
      Clear All
    </button>
  </>
) : (
  <p className="empty-state">No notifications</p>
)}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;