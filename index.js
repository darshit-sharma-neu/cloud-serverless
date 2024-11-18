const fs = require("fs");
const path = require("path");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event, context) => {
  try {
    const template = fs.readFileSync(
      path.resolve(__dirname, "template.html"),
      "utf8"
    );
    const { email, token } = JSON.parse(event.Records[0].Sns.Message);
    const baseUrl = process.env.BASE_URL || "demo.darshitsharma.me/v1";
    const url = `http://${baseUrl}/verify?email=${email}&token=${token}`;

    const mailBody = template.replace(/{{verificationLink}}/g, url);

    await sgMail.send({
      to: email,
      from: "noreply@darshitsharma.me",
      subject: "Please Verify your profile with webapp CSYE6225",
      html: mailBody,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email sent" }),
    };
  } catch (error) {
    console.log("Error", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to send email",
        error: error.message,
      }),
    };
  }
};
