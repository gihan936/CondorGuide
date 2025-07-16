import React, { useState } from 'react';
import { Form, Button, Alert, ProgressBar, InputGroup } from 'react-bootstrap';
import zxcvbn from 'zxcvbn';

const Security = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const passwordStrength = zxcvbn(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password.");
      return;
    }

    setLoading(true);

    try {
      // 🔐 Replace this with your API call
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const res = await response.json();
        throw new Error(res.message || 'Failed to change password');
      }

      setMessage(
        'Password changed successfully. Please check your email for confirmation.'
      );
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const strengthVariant = (score) => {
    switch (score) {
      case 0: return 'danger';
      case 1: return 'danger';
      case 2: return 'warning';
      case 3: return 'info';
      case 4: return 'success';
      default: return 'danger';
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: '600px' }}>
      <h3 className="mb-3">Security Settings</h3>

      <p>
        You can change your password here. After a successful change, you will receive a confirmation email.
      </p>

      <p>
        Forgot your password? <a href="/forgot-password">Reset it here</a>.
      </p>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Current Password</Form.Label>
          <InputGroup>
            <Form.Control
              type={showCurrent ? 'text' : 'password'}
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Button
              variant="outline-secondary"
              onClick={() => setShowCurrent(!showCurrent)}
            >
              {showCurrent ? 'Hide' : 'Show'}
            </Button>
          </InputGroup>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>New Password</Form.Label>
          <InputGroup>
            <Form.Control
              type={showNew ? 'text' : 'password'}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Button
              variant="outline-secondary"
              onClick={() => setShowNew(!showNew)}
            >
              {showNew ? 'Hide' : 'Show'}
            </Button>
          </InputGroup>
          {newPassword && (
            <>
              <ProgressBar
                className="mt-2"
                now={(passwordStrength.score + 1) * 20}
                variant={strengthVariant(passwordStrength.score)}
                label={passwordStrength.score >= 3 ? 'Strong' : 'Weak'}
              />
              <div className="text-muted mt-1">
                {passwordStrength.feedback.suggestions.join(' ')}
              </div>
            </>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Confirm New Password</Form.Label>
          <InputGroup>
            <Form.Control
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button
              variant="outline-secondary"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? 'Hide' : 'Show'}
            </Button>
          </InputGroup>
        </Form.Group>

        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Changing...' : 'Change Password'}
        </Button>
      </Form>
    </div>
  );
};

export default Security;
