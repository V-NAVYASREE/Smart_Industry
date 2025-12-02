📡 Smart Industry – Real-Time Multi-Zone Air Quality Monitoring & Health-Aware Alert System

A full-stack, LAN-based, industrial air-quality monitoring system built using ESP32, low-cost sensors, Flask, WebSockets, and a React.js role-based dashboard.
This system enables real-time pollutant tracking, worker-specific health risk alerts, and zone-wise environmental monitoring without requiring any cloud services.

🚀 Key Features
🔴 Multi-Zone Air Quality Monitoring

ESP32-based sensor nodes for each zone (room, floor, production unit, lab, etc.)

Measures PM1, PM2.5, PM10, VOC, CO, temperature, humidity

1-second data transmission over LAN

🧠 Health-Aware Personalized Alerts

Users can register with:

Age

Chronic conditions (asthma, cardiovascular issues, respiratory risks)

Work environment (chemical exposure, welding, etc.)

Alerts dynamically adapt using:

WHO thresholds

User health profile

ML classifier

Fuzzy logic risk estimation

🖥 Role-Based Dashboard

Admin Dashboard

Manage and view all zones

View real-time sensor streams

Access historical CSV logs

Configure thresholds

Worker/User Dashboard

View personal exposure status

Receive personalized alerts

Get safety recommendations

⚡ Offline First

Entire system runs on LAN

No internet or cloud dependency

CSV-based logging ensures reliability

📬 Alert Channels

Live dashboard alerts

Email alerts

SMS alerts (Twilio integration through environment variables)

🧩 System Architecture

ESP32 → Flask API → WebSocket Server → React Dashboard

ESP32 collects sensor data using FreeRTOS tasks

Sends JSON packets over LAN

Flask backend:

Stores data (SQLite + CSV)

Runs ML & fuzzy logic alerts

Pushes live updates to WebSocket server

React.js frontend:

Real-time risk visualization

Role-based UI

🔍 Hardware Components
Component	Purpose
ESP32-S3-WROOM	Wi-Fi transmission + sensor hub
SHT31	Temp & humidity
Panasonic SN-GCJA5	PM1, PM2.5, PM10
DFRobot VOC Sensor	VOC levels
DFRobot CO Sensor	CO ppm
DS3231 RTC	Timestamps for offline stability
OLED Display	On-device preview

(Described in detail in the invention disclosure). 

IDF2

💡 Software Stack

Arduino/ESP32 (FreeRTOS tasks)

Python Flask (API + processing + alerting)

Python ML Model (risk prediction)

Fuzzy Logic Engine

React.js (role-based dashboard)

WebSocket server (real-time updates)

SQLite + CSV logs

🔔 Functional Workflow

Sensors collect data every 1 second

ESP32 sends JSON packet → Flask backend

Backend:

Validates & stores data

Computes adaptive thresholds

Runs ML risk model

Runs fuzzy logic model

If risk detected:

Generate messages

Notify user via email/SMS

Update live dashboards

Admin views all zones; users view personalized alerts



🧪 Use Case Domains

Industrial workspaces

Hospitals / ICUs / labs

Educational institutions

Smart homes

Office floors and sections

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
