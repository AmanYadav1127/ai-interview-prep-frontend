import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CreateInterview from "./pages/CreateInterview";
import Dashboard from "./pages/Dashboard";
import InterviewRoom from "./pages/InterviewRoom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/dashboard" element={<Dashboard />} />

            <Route
      path="/create-interview"
      element={<CreateInterview />}
    />

        <Route
  path="/interview/:id"
  element={<InterviewRoom />}
/>

        <Route
          path="/interview/:id/result"
          element={<h1>Interview Result</h1>}
        />

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;