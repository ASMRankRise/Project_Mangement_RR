
const mongoose = require("mongoose");

const taskActivitySchema = new mongoose.Schema(
    {
        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
            required: true,
            index: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        action: {
            type: String,
            required: true,
            enum: [
                "created",
                "status_changed",
                "priority_changed",
                "assigned",
                "schedule_changed",
                "due_date_changed",
                "submitted",
                "completed",
            ],
        },

        field: {
            type: String,
            default: null,
        },

        oldValue: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },

        newValue: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("TaskActivity", taskActivitySchema);
