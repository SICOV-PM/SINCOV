import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home";
import Monitoring from "../pages/Monitoring/Monitoring";
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
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
