import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home";
import Monitoring from "../pages/Monitoring/Monitoring";
import Reports from "../pages/Reports/Reports";
import About from "../pages/About/About";
import Contact from "../pages/Contact/Contact";
import Layout from "../components/layout/Layout";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home sin navbar */}
        <Route path="/" element={<Home />} />

        {/* Pantallas con navbar */}
        <Route
          path="/"
          element={
            <Layout>
              <Monitoring />
            </Layout>
          }
        />
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
          path="/about"
          element={
            <Layout>
              <About />
            </Layout>
          }
        />
        <Route
          path="/contact"
          element={
            <Layout>
              <Contact />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
