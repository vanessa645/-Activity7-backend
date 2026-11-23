
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");
const recordsRouter = require("./routes/records");

const app = express();

// Allowed frontend origins
const origins = (process.env.CLIENT_ORIGINS || "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);

// Middleware
app.use(cors({ origin: origins }));
app.use(express.json());

// Welcome route - API documentation
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to the IT Support Desk API.",
        description: "A RESTful API for managing IT support records.",

        endpoints: [
            {
                method: "GET",
                path: "/",
                description: "View API documentation."
            },
            {
                method: "GET",
                path: "/health",
                description: "Check server and database status."
            },
            {
                method: "GET",
                path: "/api/records",
                description: "Retrieve all support records."
            },
            {
                method: "GET",
                path: "/api/records/:id",
                description: "Retrieve a support record by ID."
            },
            {
                method: "POST",
                path: "/api/records",
                description: "Create a new support record."
            },
            {
                method: "PUT",
                path: "/api/records/:id",
                description: "Update an existing support record."
            },
            {
                method: "DELETE",
                path: "/api/records/:id",
                description: "Delete a support record."
            }
        ],

        recordFields: {
            title: "String (3–80 characters)",
            category: "String (2–40 characters)",
            description: "String (5–300 characters)",
            status: [
                "Pending",
                "In progress",
                "Completed"
            ]
        },

        note: "POST and PUT requests require all four record fields in JSON format. The database generates the ID automatically."
    });
});

// Database health check
app.get("/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");

        res.status(200).json({
            status: "OK",
            message: "Server and database are working."
        });

    } catch (error) {
        console.error("Health check failed:", error.message);

        res.status(503).json({
            status: "ERROR",
            message: "Database connection failed."
        });
    }
});

// Records API routes
app.use("/api/records", recordsRouter);

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found."
    });
});

// Handle malformed JSON and unexpected errors
app.use((err, req, res, next) => {
    if (
        err instanceof SyntaxError &&
        err.status === 400 &&
        "body" in err
    ) {
        return res.status(400).json({
            message: "Invalid JSON format."
        });
    }

    console.error(err.message);

    res.status(500).json({
        message: "Internal server error."
    });
});

// Start server
const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on port ${port}`);
});
