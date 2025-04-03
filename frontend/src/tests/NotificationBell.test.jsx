
import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import NotificationBell from "../components/NotificationBell";
import axios from "axios";
import { act } from "react-dom/test-utils";

jest.mock("axios");

describe("NotificationBell Component", () => {
  const mockUserId = "testUser123";
  const mockNotifications = [
    { message: "Low stock alert", isRead: false },
    { message: "Price change approved", isRead: true },
  ];

  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockNotifications });
    axios.patch.mockResolvedValue({});
    axios.delete.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders bell and shows notification count", async () => {
    await act(async () => {
      render(<NotificationBell userId={mockUserId} />);
    });

    expect(await screen.findByText("🔔")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument(); // 1 unread
  });

  test("opens dropdown and displays notifications on bell click", async () => {
    await act(async () => {
      render(<NotificationBell userId={mockUserId} />);
    });

    const bellIcon = screen.getByText("🔔");
    fireEvent.click(bellIcon);

    await waitFor(() => {
      expect(screen.getByText("Low stock alert")).toBeInTheDocument();
      expect(screen.getByText("Price change approved")).toBeInTheDocument();
    });
  });

  test("calls API to mark notifications as read on dropdown open", async () => {
    await act(async () => {
      render(<NotificationBell userId={mockUserId} />);
    });

    const bellIcon = screen.getByText("🔔");
    fireEvent.click(bellIcon);

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        `http://localhost:5001/api/notifications/mark-read/${mockUserId}`
      );
    });
  });

  test("clears all notifications when Clear All is clicked", async () => {
    await act(async () => {
      render(<NotificationBell userId={mockUserId} />);
    });

    const bellIcon = screen.getByText("🔔");
    fireEvent.click(bellIcon);

    await waitFor(() => {
      fireEvent.click(screen.getByText("Clear All"));
    });

    await waitFor(() => {
      expect(screen.getByText("No notifications")).toBeInTheDocument();
    });

    expect(axios.delete).toHaveBeenCalledWith(
      `http://localhost:5001/api/notifications/clear/${mockUserId}`
    );
  });

  test("shows 'No notifications' when list is empty", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    await act(async () => {
      render(<NotificationBell userId={mockUserId} />);
    });

    const bellIcon = screen.getByText("🔔");
    fireEvent.click(bellIcon);

    await waitFor(() => {
      expect(screen.getByText("No notifications")).toBeInTheDocument();
    });
  });
});