import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button, Result, Spin, Typography, Card } from "antd";
import { useActiveAccountMutation, useResendActiveAccountMutation } from "@/api/authApi";

const { Title, Text } = Typography;

export default function ActiveAccount() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  const [activeAccount] = useActiveAccountMutation();
  const [resendActivation] = useResendActiveAccountMutation();
  
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const activateAccount = async () => {
    setLoading(true);
    try {
      if (!email || !token) {
        throw new Error("Invalid activation information!");
      }

      const response = await activeAccount({ email, token }).unwrap();
      
      if (response.success) {
        setSuccess(true);
        setSuccessMessage(response.message || "Account activation successful!");
      } else {
        setError(response.message || "An error occurred while activating the account");
      }
    } catch (error) {
      setError(
        error.data?.message || 
        error.message || 
        "An error occurred while activating the account"
      );
    } finally {
      setLoading(false);
    }
  };

  const requestNewActivation = async () => {
    setLoading(true);
    try {
      if (!email) {
        throw new Error("Email does not exist!");
      }

      const response = await resendActivation({ email }).unwrap();
      
      if (response.success) {
        setSuccess(true);
        setSuccessMessage("Activation email has been resent. Please check your inbox.");
      } else {
        setError(response.message || "Could not resend activation email");
      }
    } catch (error) {
      setError(
        error.data?.message || 
        error.message || 
        "Could not resend activation email"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (email && token) {
      activateAccount();
    } else {
      setLoading(false);
      setError("Invalid activation link!");
    }
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-[var(--primary-dark)] text-[var(--text-primary)] flex items-center justify-center">
        <Card className="p-8 shadow-md w-full max-w-md">
          <div className="text-center">
            <Spin size="large" />
            <Title level={3} className="mt-4">Activating account...</Title>
            <Text type="secondary">Please wait a moment</Text>
          </div>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="h-screen bg-[var(--primary-dark)] text-[var(--text-primary)] flex items-center justify-center">
        <Result
          status="success"
          title={successMessage}
          subTitle="You can now log in and use our services."
          extra={[
            <Button type="primary" key="login">
              <Link to="/login">Login now</Link>
            </Button>
          ]}
        />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[var(--primary-dark)] text-[var(--text-primary)] flex items-center justify-center">
      <Result
        className="!text-[var(--text-primary)]"
        status="error"
        title="Could not activate account"
        extra={[
          <Button type="primary" key="resend" onClick={requestNewActivation}>
            Resend activation email
          </Button>,
          <Button key="login">
            <Link to="/login">Back to login</Link>
          </Button>
        ]}
      />
    </div>
  );
}
