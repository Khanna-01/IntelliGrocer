import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import EmployeeDashboard from "../pages/employee-dashboard";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";


jest.mock("axios");


const mockDashboardData = ({ inventory = [], tasks = [], schedule = [], notifications = [] } = {}) => {
  axios.get.mockImplementation((url) => {
    if (url.includes("/api/inventory")) {
      return Promise.resolve({ data: inventory });
    } else if (url.includes("/api/tasks")) {
      return Promise.resolve({ data: tasks });
    } else if (url.includes("/api/schedule")) {
      return Promise.resolve({ data: schedule });
    } else if (url.includes("/api/notifications")) {
      return Promise.resolve({ data: notifications });
    } else {
      return Promise.reject(new Error(" Unknown API endpoint: " + url));
    }
  });
};

beforeEach(() => {
  localStorage.setItem("username", "TestEmployee");
  localStorage.setItem("employeeId", "507f191e810c19729de860ea");
});

afterEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe("EmployeeDashboard", () => {
  test("renders welcome message with username", async () => {
    mockDashboardData();
    render(
      <MemoryRouter>
        <EmployeeDashboard />
      </MemoryRouter>
    );
    expect(await screen.findByText(/Welcome, TestEmployee/i)).toBeInTheDocument();
  });

  test("displays pending and completed tasks count", async () => {
    mockDashboardData({
      tasks: [
        { _id: "1", title: "Task 1", status: "Pending", description: "Do something" },
        { _id: "2", title: "Task 2", status: "Completed", description: "Done" },
      ],
    });

    render(
      <MemoryRouter>
        <EmployeeDashboard />
      </MemoryRouter>
    );

    // Wait for tasks section to render
    expect(await screen.findByText(/Pending Tasks/i)).toBeInTheDocument();

    const pendingCard = screen.getByText(/Pending Tasks/i).closest("div");
    const completedCard = screen.getByText(/Completed Tasks/i).closest("div");

    expect(pendingCard).toHaveTextContent("1");
    expect(completedCard).toHaveTextContent("1");
  });

  test("displays assigned tasks when clicking Tasks tab", async () => {
    mockDashboardData({
      tasks: [
        {
          _id: "123",
          title: "Test Task",
          description: "Complete this task",
          status: "Pending",
        },
      ],
    });

    render(
      <MemoryRouter>
        <EmployeeDashboard />
      </MemoryRouter>
    );

    await fireEvent.click(await screen.findByText("Tasks"));
    expect(await screen.findByText("Test Task")).toBeInTheDocument();
    expect(screen.getByText(/Complete this task/i)).toBeInTheDocument();
  });

  test("shows inventory items with request input", async () => {
    mockDashboardData({
      inventory: [
        {
          _id: "inv1",
          name: "Apple",
          basePrice: 2.5,
          stockLevel: 50,
          image: "apple.png",
        },
      ],
    });

    render(
      <MemoryRouter>
        <EmployeeDashboard />
      </MemoryRouter>
    );

    await fireEvent.click(await screen.findByText("Inventory"));
    expect(await screen.findByText(/Apple/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Request change...")).toBeInTheDocument();
  });

  test("renders schedule data correctly", async () => {
    mockDashboardData({
      schedule: [
        {
          shifts: [
            {
              shiftStart: "2025-03-28T09:00:00Z",
              shiftEnd: "2025-03-28T17:00:00Z",
              notes: "Morning shift",
            },
          ],
        },
      ],
    });

    render(
      <MemoryRouter>
        <EmployeeDashboard />
      </MemoryRouter>
    );

    await fireEvent.click(await screen.findByText("Schedule"));
    expect(await screen.findByText(/Morning shift/i)).toBeInTheDocument();
  });
});