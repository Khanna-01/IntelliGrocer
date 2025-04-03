const express = require("express");
const router = express.Router();
const Schedule = require("../models/Schedule");
const User = require("../models/User");
const scheduleController = require("../controllers/scheduleController");
const Notification = require("../models/Notification");


router.post("/assign", scheduleController.assignSchedule);


router.get("/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    console.log("📢 Fetching schedule for:", employeeId);

    const schedule = await Schedule.find({ employeeId });
    if (!schedule.length) {
      return res.status(404).json({ error: "Schedule not found for this employee." });
    }

    res.json(schedule);
  } catch (error) {
    console.error(" Error fetching schedule:", error);
    res.status(500).json({ error: "Server error while fetching schedule" });
  }
});

  
router.post("/", async (req, res) => {
  try {
    console.log("Received Schedule:", req.body);

    const { employeeId, shiftStart, shiftEnd, notes } = req.body;

    if (!employeeId || !shiftStart || !shiftEnd) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    
    let schedule = await Schedule.findOne({ employeeId });

    if (!schedule) {
      
      schedule = new Schedule({ employeeId, employeeName: employee.username, shifts: [] });
    }

    
    schedule.shifts.push({
      shiftStart,
      shiftEnd,
      notes,
    });

    
    await schedule.save();
    console.log(" Shift assigned successfully:", schedule);

    await Notification.create({
      userId: employeeId,
      role: "employee",
      message: `You have been scheduled for a new shift from ${shiftStart} to ${shiftEnd}`,
    });

    res.status(201).json({ message: "Shift assigned successfully", schedule });
  } catch (err) {
    console.error(" Error creating schedule:", err);
    res.status(500).json({ error: "Server error while creating schedule" });
  }
});
  


router.delete("/:id", async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: "Schedule deleted successfully" });
  } catch (err) {
    console.error(" Error deleting schedule:", err); 
    res.status(500).json({ error: "Server error while deleting schedule" });
  }
});

module.exports = router;