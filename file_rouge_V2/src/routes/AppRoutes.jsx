import { Routes, Route, Navigate } from "react-router-dom";

import ClientLayout from "../components/ClientLayout";
import OwnerLayout from "../components/OwnerLayout";
import AuthGuard from "../guards/AuthGuard";
import RoleGuard from "../guards/RoleGuard";

import Login from "../pages/Login";
import Register from "../pages/Register";
import ClientDashboard from "../pages/client/ClientDashboard";
import ClientCars from "../pages/client/ClientCars";
import ClientReservations from "../pages/client/ClientReservations";
import CarDetails from "../pages/client/CarDetails";
import ClientProfile from "../pages/client/ClientProfile";
import OwnerDashboard from "../pages/owner/OwnerDashboard";
import OwnerCars from "../pages/owner/OwnerCars";
import OwnerCarForm from "../pages/owner/OwnerCarForm";
import OwnerCarDetails from "../pages/owner/OwnerCarDetails";
import OwnerReservations from "../pages/owner/OwnerReservations";
import OwnerProfile from "../pages/owner/OwnerProfile";
import AdminLayout from "../components/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminAnnouncements from "../pages/admin/AdminAnnouncements";
import AdminProfile from "../pages/admin/AdminProfile";
import HomePage from "../pages/HomePage";

function AppRoutes() {
    return (
        <Routes>

            <Route path="/" element={<HomePage />} />
            <Route path="/cars/:id" element={<CarDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<AuthGuard />}>

                <Route element={<RoleGuard roles={["CLIENT"]} />}>

                    <Route element={<ClientLayout />}>
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

                        <Route
                            path="/client/profile"
                            element={<ClientProfile />}
                        />
                    </Route>

                </Route>

                <Route element={<RoleGuard roles={["OWNER"]} />}>

                    <Route element={<OwnerLayout />}>
                        <Route path="/owner" element={<OwnerDashboard />} />
                        <Route path="/owner/cars" element={<OwnerCars />} />
                        <Route path="/owner/cars/new" element={<OwnerCarForm />} />
                        <Route path="/owner/cars/:id" element={<OwnerCarDetails />} />
                        <Route path="/owner/cars/:id/edit" element={<OwnerCarForm />} />
                        <Route path="/owner/reservations" element={<OwnerReservations />} />
                        <Route path="/owner/profile" element={<OwnerProfile />} />
                    </Route>

                </Route>

                <Route element={<RoleGuard roles={["ADMIN"]} />}>
                    <Route element={<AdminLayout />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/users" element={<AdminUsers />} />
                        <Route path="/admin/annonces" element={<AdminAnnouncements />} />
                        <Route path="/admin/profile" element={<AdminProfile />} />
                    </Route>
                </Route>

            </Route>

            <Route path="/403" element={<div className="access-denied"><h1>Accès refusé</h1><p>Vous n'avez pas l'autorisation d'accéder à cette page.</p></div>} />
            <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
    );
}

export default AppRoutes;
