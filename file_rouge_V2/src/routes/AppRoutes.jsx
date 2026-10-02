import { Routes, Route, Navigate } from "react-router-dom";

import AuthGuard from "../guards/AuthGuard";
import RoleGuard from "../guards/RoleGuard";

import Login from "../pages/Login";
import Register from "../pages/Register";
import ClientDashboard from "../pages/client/ClientDashboard";
import ClientCars from "../pages/client/ClientCars";
import ClientReservations from "../pages/client/ClientReservations";
import CarDetails from "../pages/client/CarDetails";

function AppRoutes() {
    return (
        <Routes>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<AuthGuard />}>

                <Route element={<RoleGuard roles={["CLIENT"]} />}>

                    <Route
                        path="/client"
                        element={<ClientDashboard />}
                    />

                    <Route
                        path="/client/cars"
                        element={<ClientCars />}
                    />

                    <Route
                        path="/client/cars/:id"
                        element={<CarDetails />}
                    />

                    <Route
                        path="/client/reservations"
                        element={<ClientReservations />}
                    />

                </Route>

            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
    );
}

export default AppRoutes;