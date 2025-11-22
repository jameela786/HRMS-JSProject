require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./db");
const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employees");
const teamRoutes = require("./routes/teams");
const logsRoutes = require("./routes/logs");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// CONNECT DB ON START
connectDB();

// REGISTER ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/logs", logsRoutes);
app.get("/", (req, res) => {
  res.send("HRMS Backend is running 🚀");
});



app.use(errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(5000, () => console.log(`🚀 Server running on port 5000`));
