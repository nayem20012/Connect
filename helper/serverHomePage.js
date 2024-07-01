const fs = require("fs");
const path = require("path");

require("dotenv").config();

function generateResponseTimesTable(responseTimes) {
  if (responseTimes.length === 0) {
    return "<p>No response time data available.</p>";
  }

  let tableHtml = `
    <table>
      <thead>
        <tr>
          <th>Route</th>
          <th>Response Time (ms)</th>
          <th>Label</th>
        </tr>
      </thead>
      <tbody>
  `;

  responseTimes.forEach((entry) => {
    // Determine CSS class based on label value
    let labelClass = entry.label === "High" ? "high-label" : "";

    // Construct table row with conditional class
    tableHtml += `
      <tr class="${labelClass}">
        <td>${entry.route}</td>
        <td>${entry.time}</td>
        <td>${entry.label}</td>
      </tr>
    `;
  });

  tableHtml += `
      </tbody>
    </table>
  `;

  return tableHtml;
}

// Function to generate the HTML page
function serverHomePage(req) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${process.env.APP_NAME} Server</title>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
        />
        <style>
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
           background: linear-gradient(to right, #00b09b, #96c93d);
            font-family: Arial, sans-serif;
            margin: 0;
          }
          .container {
            text-align: center;
            background: white;
            padding: 2em;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            max-width: 800px;
            width: 40%;
            margin: auto;
          }
          h1 {
            font-size: 2.5em;
            margin: 0.5em 0;
          }
          .high-label {
            background-color: red; /* or any other style you want to apply */
            color: white; /* optional: white text on red background */
          }
          p {
            font-size: 1.2em;
            color: #333;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #dddddd;
            text-align: left;
            padding: 8px;
          }
          th {
            background-color: #f2f2f2;
          }
        </style>
      </head>
      <body>
        <div class="container animate__animated animate__bounce">
          <h1>${`${process.env.APP_NAME} Server is alive!`}</h1>
          <p>Welcome to our awesome server!</p>
          <div id="response-times">
            <h2>The API response is currently running.</h2>
        
          </div>
          <div id="log-table">
           
        
          </div>
        </div>
      </body>
    </html>
  `;
}

module.exports = serverHomePage;
