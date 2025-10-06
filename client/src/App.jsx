import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Movies from "./pages/Movies"
import MovieDetails from "./pages/MovieDetails"
import SeatLayout from "./pages/SeatLayout"
import MyBookings from "./pages/MyBookings"
import Favorite from "./pages/Favorite"
import { Toaster } from "react-hot-toast"
import Footer from "./components/Footer"
import Layout from "./pages/admin/Layout"
import Dashboard from "./pages/admin/Dashboard"
import AddShows from "./pages/admin/AddShows"
import ListShows from "./pages/admin/ListShows"
import ListBookings from "./pages/admin/ListBookings"
import PrivateRoutes from "./utils/PrivateRoutes"
import RoleBaseRoutes from "./utils/RoleBaseRoutes"
import Login from "./pages/Login"
import Register from "./pages/Register"
import { useAuth } from "./context/authContext"

const App = () => {
    const isAdminRoute = useLocation().pathname.startsWith('/admin');
    const { user } = useAuth();

    return (
        <>
            <Toaster />
            {!isAdminRoute && <Navbar />}

            <Routes>
                <Route path="/" element={
                    localStorage.getItem("token")
                        ? <Navigate to="/home" replace />
                        : <Navigate to="/login" replace />
                } />

                <Route path="/login" element={!user ? <Login /> : <Navigate to="/home" />} />
                <Route path="/register" element={!user ? <Register /> : <Navigate to="/home" />} />

                <Route path='/home' element={
                    <PrivateRoutes>
                        <RoleBaseRoutes requiredRole={['user']}>
                            <Home />
                        </RoleBaseRoutes>
                    </PrivateRoutes>
                } />

                <Route path='/movies' element={<Movies />} />
                <Route path='/movies/:id' element={<MovieDetails />} />
                <Route path='/movies/:id/:date' element={<SeatLayout />} />
                <Route path='/my-bookings' element={<MyBookings />} />
                <Route path='/favorite' element={<Favorite />} />

                <Route path="/admin/*" element={
                    <PrivateRoutes>
                        <RoleBaseRoutes requiredRole={['admin']}>
                            <Layout />
                        </RoleBaseRoutes>
                    </PrivateRoutes>
                }>
                    <Route index element={<Dashboard />} />
                    <Route path="add-shows" element={<AddShows />} />
                    <Route path="list-shows" element={<ListShows />} />
                    <Route path="list-bookings" element={<ListBookings />} />
                </Route>
            </Routes>

            {!isAdminRoute && <Footer />}
        </>
    )
}

export default App
