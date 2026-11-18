
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendTaskAssignmentEmail = async ({
    to,
    task,
    projectName,
    assignedBy,
}) => {
    return transporter.sendMail({
        from: `"Project Management" <${process.env.EMAIL_USER}>`,
        to,
        subject: `New Task Assigned: ${task.title}`,
        text: `
Hello,

A new task has been assigned to you.

Task: ${task.title}
Description: ${task.description || "No description"}
Project: ${projectName}
Priority: ${task.priority}
Due Date: ${task.dueDate || "Not specified"}
Assigned By: ${assignedBy}

Please login to your Project Management System to view the task.
    `,
    });
};

module.exports = { sendTaskAssignmentEmail };
