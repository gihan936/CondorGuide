import React from "react";
import { Container, Button, Card } from "react-bootstrap";
import { motion as Motion } from "framer-motion";

const DonationPage = () => {
  return (
    <Container className="py-5">
      <Motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-4 shadow-lg text-center">
          <h2 className="mb-3" style={{ color: "#e1c212" }}>Support Condor Guide</h2>
          <p>
            Your donation helps us maintain and improve this platform for students and staff.
          </p>
          <Button
            href="https://donate.stripe.com/test_bJe9AS4ce2Am0U2f0ZbMQ00"
            target="_blank"
            rel="noopener noreferrer"
            variant="warning"
            className="mt-3 px-4 py-2 fw-bold"
          >
            Donate Securely via Stripe
          </Button>
        </Card>
      </Motion.div>
    </Container>
  );
};

export default DonationPage;
