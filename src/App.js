import "./Stopgap.scss";
import React from "react";
import Footer from "./components/Footer/Footer";
import Router from "./router/router";
import { BrowserRouter as ReactRouter } from "react-router-dom";

export default function App() {
    console.log("App GIT Commit: " + process.env.REACT_APP_VERSION);

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", justifyContent: "space-between" }}>
            <ReactRouter>
                <Router />
                <Footer />
            </ReactRouter>
        </div>
    );
}