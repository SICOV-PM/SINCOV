import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "../components/layout/Layout";
import About from "../pages/About/About";
//import Contact from "../pages/Contact/Contact";
import Home from "../pages/Home/Home";
import Monitoring from "../pages/Monitoring/Monitoring";
import Predictions from "../pages/Predictions/Predictions"; // ✅ Nueva importación
import Reports from "../pages/Reports/Reports";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home sin navbar */}
        <Route path="/" element={<Home />} />

        {/* Pantallas con navbar */}
        <Route
          path="/monitoring"
          element={
            <Layout>
              <Monitoring />
            </Layout>
          }
        />
        <Route
          path="/reports"
          element={
            <Layout>
              <Reports />
            </Layout>
          }
        />
        <Route
          path="/predictions"
          element={
            <Layout>
              <Predictions />
            </Layout>
          }
        />
        <Route
          path="/about"
          element={
            <Layout>
              <About />
            </Layout>
          }
        />
        {/*
        <Route
          path="/contact"
          element={
            <Layout>
              <Contact />
            </Layout>
          }
        />
        */}
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
