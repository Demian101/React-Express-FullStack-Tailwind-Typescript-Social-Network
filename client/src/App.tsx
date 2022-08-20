import Navbar from "@components/Navbar/Navbar";
import ProtectedRoute from "./pages/ProtectedRoute";
import Loader from "@shared/Loader";
import React, { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

const HomeScreen = lazy(
  () => import("./pages/HomeScreen" /* webpackChunkName: "HomeScreen" */)
);

const SearchScreen = lazy(
  () => import("./pages/SearchScreen" /* webpackChunkName: "SearchScreen" */)
);
const LoginScreen = lazy(
  () => import("./pages/LoginScreen" /* webpackChunkName: "LoginScreen" */)
);
const UserScreen = lazy(
  () => import("./pages/UserScreen" /* webpackChunkName: "UserScreen" */)
);
const RegisterScreen = lazy(
  () =>
    import("./pages/RegisterScreen" /* webpackChunkName: "RegisterScreen" */)
);
const ProfileScreen = lazy(
  () =>
    import("./pages/ProfileScreen" /* webpackChunkName: "ProfileScreen" */)
);
const ChatScreen = lazy(
  () => import("./pages/ChatScreen" /* webpackChunkName: "ChatScreen" */)
);

export const queryClient = new QueryClient();
function App() {
  return (
    <>
      <Router>
        <QueryClientProvider client={queryClient}>
          <Navbar />
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <HomeScreen />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/register" element={<RegisterScreen />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfileScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/:id"
                element={
                  <ProtectedRoute>
                    <UserScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <ChatScreen />
                  </ProtectedRoute>
                }
              />

              <Route path="/search/:query" element={<SearchScreen />} />
            </Routes>
          </Suspense>
        </QueryClientProvider>
      </Router>
    </>
  );
}

export default App;
