const fs = require("fs");
const path = require("path");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event, context) => {
  console.log("Handler invoked with event:", JSON.stringify(event, null, 2));
  try {
    console.log("Reading email template...");
    const template = fs.readFileSync(
      path.resolve(__dirname, "template.html"),
      "utf8"
    );
    console.log("Template successfully read");

    console.log("Parsing SNS message...");
    const { email, token } = JSON.parse(event.Records[0].Sns.Message);
    console.log("Extracted email:", email);
    console.log("Extracted token:", token);

    const baseUrl = process.env.BASE_URL || "demo.darshitsharma.me/v1";
    const fromEmail = process.env.FROM_EMAIL || `noreply@darshitsharma.me`;
    console.log("Base URL:", baseUrl);
    console.log("From Email:", fromEmail);

    const url = `http://${baseUrl}/verify?email=${email}&token=${token}`;
    console.log("Generated verification link:", url);

    const mailBody = template.replace(/{{verificationLink}}/g, url);

    console.log("Sending email...");
    await sgMail.send({
      to: email,
      from: fromEmail,
      subject: "Please Verify your profile with webapp CSYE6225",
      html: mailBody,
    });
    console.log("Email successfully sent to:", email);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email sent" }),
    };
  } catch (error) {
    console.error("Error occurred during email sending process:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to send email",
        error: error.message,
      }),
    };
  }
};
