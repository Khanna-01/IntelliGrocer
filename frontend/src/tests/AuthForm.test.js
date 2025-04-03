import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import AuthForm from "../components/AuthForm";


jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: jest.fn()
  };
});

describe("AuthForm Component", () => {
  test("renders login form fields", () => {
    render(<AuthForm isLogin={true} setIsLogin={() => {}} setIsForgot={() => {}} onLogin={() => {}} />);

    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("shows error when login fields are empty", async () => {
    render(<AuthForm isLogin={true} setIsLogin={() => {}} setIsForgot={() => {}} onLogin={() => {}} />);

    const button = screen.getByRole("button", { name: /login/i });
    fireEvent.click(button);

    expect(await screen.findByText(/all fields are required/i)).toBeInTheDocument();
  });

  test("renders sign up form when not in login mode", () => {
    render(<AuthForm isLogin={false} setIsLogin={() => {}} setIsForgot={() => {}} onLogin={() => {}} />);

    expect(screen.getByPlaceholderText("Full Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });
});