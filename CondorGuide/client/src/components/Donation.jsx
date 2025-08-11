import React from "react";
import { Button, Container } from "react-bootstrap";
import { motion as Motion } from "framer-motion";
import classroomsImg from "../assets/admissions_office.jpg";
import mapImg from "../assets/collage_main_building.jpg";

const DonationPage = () => {
  return (
    <div style={{ background: "#f8f9fa", fontFamily: "Inter, sans-serif" }}>
      {/* Hero Section */}
      <div
        style={{
          background: "linear-gradient(to right, #0f2027, #203a43, #2c5364)",
          color: "#fff",
          padding: "80px 0",
          textAlign: "center",
        }}
      >
        <h1 className="fw-bold display-5">Support the Future of CondorGuide</h1>
        <p className="lead mt-3 px-3" style={{ maxWidth: "800px", margin: "0 auto" }}>
          Condor Guide is more than a project. it's a mission to make student life smarter, safer, and more accessible.
          Your donation fuels innovation built by students, for students.
        </p>
        <Motion.div whileHover={{ scale: 1.05 }} className="mt-4">
          <Button
            href="https://donate.stripe.com/test_bJe9AS4ce2Am0U2f0ZbMQ00"
            target="_blank"
            rel="noopener noreferrer"
            variant="warning"
            size="lg"
            className="fw-bold px-5 py-3"
          >
            Donate Securely
          </Button>
        </Motion.div>
      </div>

      {/* Content Section */}
      <Container className="py-5">
        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white p-5 rounded-4 shadow-lg mb-5" style={{ backdropFilter: "blur(12px)" }}>
            <h2 className="text-center fw-bold mb-4">Why We Need Your Support</h2>
            <div style={{ fontSize: "1.3rem", lineHeight: "1.8", textAlign: "justify" }}>
              <img
                src={classroomsImg}
                alt="Classrooms"
                style={{
                  float: "left",
                  width: "280px",
                  height: "auto",
                  marginRight: "20px",
                  borderRadius: "12px",
                  marginBottom: "15px",
                }}
              />
              CondorGuide is a smart digital companion created to transform how students, staff, and faculty experience
              life at Conestoga College. Born out of real problems students face dailylike finding an empty classroom,
              navigating through unfamiliar buildings, or reporting a broken light—this app simplifies the complex.
              <br /><br />
              Your donation enables us to keep building features like emergency alerts, maintenance reports with image uploads,
              classroom locators, and navigation that adapts to disabilities and preferences. It also supports infrastructure
              like secure servers, API integrations, Stripe payments, and full accessibility compliance.
              <br /><br />
              <img
                src={mapImg}
                alt="Campus Map"
                style={{
                  float: "right",
                  width: "280px",
                  height: "auto",
                  marginLeft: "20px",
                  borderRadius: "12px",
                  marginBottom: "15px",
                }}
              />
              Conestoga is a leader in polytechnic education, and this app embodies that legacy students developing real-world
              solutions for their community. With your help, we can expand CondorGuide beyond one campus, release native mobile
              versions, and continuously enhance its performance, security, and accessibility.
              <br /><br />
              Whether you’re a proud Conestoga alum, a current student, a faculty member, or someone who simply believes
              in building accessible, innovative solutions your support drives this vision forward. Every contribution is an
              investment in smarter, safer, and more connected campuses. We are not just building an app we’re creating
              a movement that champions smart campus living powered by the community itself.
            </div>
          </div>
        </Motion.div>
      </Container>
    </div>
  );
};

export default DonationPage;
