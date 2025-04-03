import React, { act } from "react"; 
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import ManagerDashboard from "../pages/manager-dashboard";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";


HTMLCanvasElement.prototype.getContext = () => ({
  fillRect: () => {},
  clearRect: () => {},
  getImageData: () => ({ data: [] }),
  putImageData: () => {},
  createImageData: () => [],
  setTransform: () => {},
  drawImage: () => {},
  save: () => {},
  fillText: () => {},
  restore: () => {},
  beginPath: () => {},
  moveTo: () => {},
  lineTo: () => {},
  closePath: () => {},
  stroke: () => {},
  translate: () => {},
  scale: () => {},
  rotate: () => {},
  arc: () => {},
  fill: () => {},
  measureText: () => ({ width: 0 }),
  transform: () => {},
  rect: () => {},
  clip: () => {},
});

jest.mock("axios");

const mockDashboardData = ({
  inventory = [],
  sales = { dates: [], revenues: [] },
  employees = [],
  pricing = {},
} = {}) => {
  axios.get.mockImplementation((url) => {
    if (url.includes("/api/inventory")) {
      return Promise.resolve({ data: inventory });
    } else if (url.includes("/api/sales/analytics")) {
      return Promise.resolve({ data: sales });
    } else if (url.includes("/api/employees")) {
      return Promise.resolve({ data: employees });
    } else if (url.includes("/api/pricing/dynamic")) {
      return Promise.resolve({ data: pricing });
    } else {
      return Promise.reject(new Error(" Unknown API endpoint: " + url));
    }
  });
};

beforeEach(() => {
  localStorage.setItem("username", "ManagerOne");
  localStorage.setItem("userId", "507f1f77bcf86cd799439011");
  localStorage.setItem("role", "Manager");
});

afterEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe("ManagerDashboard", () => {
  test("renders welcome message with username", async () => {
    mockDashboardData();

    await act(async () => {
      render(
        <MemoryRouter>
          <ManagerDashboard />
        </MemoryRouter>
      );
    });

    expect(await screen.findByText(/Welcome, ManagerOne/i)).toBeInTheDocument();
  });

  test("displays inventory item Banana with base price", async () => {
    mockDashboardData({
      inventory: [
        {
          _id: "item123",
          name: "Banana",
          basePrice: 1.5,
          stockLevel: 100,
        },
      ],
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <ManagerDashboard />
        </MemoryRouter>
      );
    });

    fireEvent.click(await screen.findByText("Inventory"));

    expect(await screen.findByText(/Banana/i)).toBeInTheDocument();
    expect(screen.getByText(/\$?1\.5/)).toBeInTheDocument();
  });
});