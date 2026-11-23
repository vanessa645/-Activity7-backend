
const express = require("express");
const router = express.Router();
const pool = require("../db");

// Validate record details
function validateRecord(body) {
    const { title, category, description, status } = body;

    if (
        typeof title !== "string" ||
        typeof category !== "string" ||
        typeof description !== "string" ||
        typeof status !== "string"
    ) {
        return "All fields must be strings.";
    }

    const cleanTitle = title.trim();
    const cleanCategory = category.trim();
    const cleanDescription = description.trim();

    if (cleanTitle.length < 3 || cleanTitle.length > 80) {
        return "Title must be between 3 and 80 characters.";
    }

    if (cleanCategory.length < 2 || cleanCategory.length > 40) {
        return "Category must be between 2 and 40 characters.";
    }

    if (cleanDescription.length < 5 || cleanDescription.length > 300) {
        return "Description must be between 5 and 300 characters.";
    }

    if (!["Pending", "In progress", "Completed"].includes(status)) {
        return "Status must be Pending, In progress, or Completed.";
    }

    return null;
}

// GET all records
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM records ORDER BY id ASC"
        );

        res.status(200).json(result.rows);

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Failed to retrieve records."
        });
    }
});

// GET one record by ID
router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid record ID."
            });
        }

        const result = await pool.query(
            "SELECT * FROM records WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Record not found."
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Failed to retrieve record."
        });
    }
});

// POST create a new record
router.post("/", async (req, res) => {
    try {
        const validationError = validateRecord(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const { title, category, description, status } = req.body;

        const result = await pool.query(
            `INSERT INTO records (title, category, description, status)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
                title.trim(),
                category.trim(),
                description.trim(),
                status
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Failed to create record."
        });
    }
});

// PUT update an existing record
router.put("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid record ID."
            });
        }

        const validationError = validateRecord(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const { title, category, description, status } = req.body;

        const result = await pool.query(
            `UPDATE records
             SET title = $1,
                 category = $2,
                 description = $3,
                 status = $4
             WHERE id = $5
             RETURNING *`,
            [
                title.trim(),
                category.trim(),
                description.trim(),
                status,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Record not found."
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Failed to update record."
        });
    }
});

// DELETE an existing record
router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid record ID."
            });
        }

        const result = await pool.query(
            "DELETE FROM records WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Record not found."
            });
        }

        res.status(200).json({
            message: "Record deleted."
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Failed to delete record."
        });
    }
});

// Export router
module.exports = router;
