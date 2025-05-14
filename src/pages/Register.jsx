import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { authAPI } from "../api";

const AuthContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 50px);
  background-color: #f9fafc;
`;

const AuthForm = styled.form`
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 32px;
  border-radius: 3px;
  width: 400px;
`;

const FormTitle = styled.h2`
  margin-bottom: 24px;
  text-align: center;
  font-weight: bold;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #dfe1e6;
  border-radius: 3px;
  font-size: 16px;

  &:focus {
    border-color: #0079bf;
    outline: none;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #0079bf;
  color: white;
  border: none;
  border-radius: 3px;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;

  &:hover {
    background-color: #026aa7;
  }

  &:disabled {
    background-color: #b3d1e2;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #eb5a46;
  margin-bottom: 16px;
  text-align: center;
`;

const AuthLink = styled.div`
  text-align: center;

  a {
    color: #0079bf;
    text-decoration: underline;
  }
`;

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // In a real app, you would make an API call
      // const response = await authAPI.register({ name, email, password });
      // localStorage.setItem('token', response.data.token);

      // For now, simulate a successful registration
      console.log("Registration attempt with:", { name, email, password });
      localStorage.setItem("token", "fake-jwt-token");

      // Redirect to dashboard
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to register. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthForm onSubmit={handleSubmit}>
        <FormTitle>Sign up for BoardHub</FormTitle>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <FormGroup>
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
          />
        </FormGroup>

        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Sign up"}
        </SubmitButton>

        <AuthLink>
          Already have an account? <Link to="/login">Log in</Link>
        </AuthLink>
      </AuthForm>
    </AuthContainer>
  );
};

export default Register;
