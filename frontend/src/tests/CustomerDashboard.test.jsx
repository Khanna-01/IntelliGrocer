import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CustomerDashboard from "../pages/customer-dashboard";
import axios from "axios";

jest.mock("axios");

beforeEach(() => {
  localStorage.setItem("username", "TestUser");

  axios.get.mockImplementation((url) => {
    if (url.includes("/inventory")) {
      return Promise.resolve({ data: [] });
    }
    if (url.includes("/orders")) {
      return Promise.resolve({ data: [] });
    }
    if (url.includes("/notifications")) {
      return Promise.resolve({ data: [] });
    }
    return Promise.resolve({ data: [] });
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

test("renders welcome message with username", async () => {
  render(
    <MemoryRouter>
      <CustomerDashboard />
    </MemoryRouter>
  );

  expect(await screen.findByText(/Welcome, TestUser/i)).toBeInTheDocument();
});