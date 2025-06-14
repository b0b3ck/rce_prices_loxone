# ⚡ RCE Prices to Loxone

This project fetches electricity prices (e.g., from PSE) and makes them accessible via a simple REST API for use with [Loxone](https://www.loxone.com/) smart home systems or any automation controller.

---

## 🚀 Features

- Fetches current electricity prices on a schedule
- Stores data in MongoDB
- REST API to expose price data
- Node.js + Express + Mongoose-based
- Easy to deploy locally or via Docker

---

## 📁 Project Structure

```text
rce_prices_loxone/
├── server.js           # Main app entry point
├── routes/
│   └── api.js          # API route for serving stored price data
├── services/
│   └── prices.js       # Logic for fetching and processing PSE price data
├── models/
│   └── Price.js        # Mongoose schema for price entries
├── scheduler.js        # Cron-based task to fetch prices on a schedule
├── .env.example        # Example environment configuration file
```
## ⚙️ Requirements

- Node.js 18+ (recommended: Node 20 or 24)
- MongoDB 6+
- Internet access to fetch data from PSE API

## 🛠 Installation

1. Clone the Repo
    ```text
    it clone https://github.com/b0b3ck/rce_prices_loxone.git\
    cd rce_prices_loxone
    ```
2. Create and Configure .env\
Copy the example:
    ```text
    cp .env.example .env
    ```
    Then update the values in .env:
    ```text
    MONGO_URI=mongodb://localhost:27017/rce_prices
    PSE_API_BASE=https://your-api-url
    ```
3. Install Dependencies
    ```text
    npm install
    ```
4. Start the Server
    ```text
    npm start
    ```
    Visit: http://localhost:3000

## 🐳 Docker Deployment
Use the following Docker Compose setup:\
    
    version: '3'
    services:
        app:
            image: node:24-alpine
            working_dir: /app
            command: >
                sh -c "
                apk add --no-cache git &&
                git clone https://github.com/b0b3ck/rce_prices_loxone.git . &&
                npm install &&
                npm start
                "
            environment:
                - MONGO_URI=mongodb://mongo:27017/rce_prices
                - PSE_API_BASE=https://your-api-url
            ports:
                - "3000:3000"
            depends_on:
                - mongo

        mongo:
            image: mongo:6
            restart: always
            ports:
                - "27017:27017"
        volumes:
            - mongodb_data:/data/db

    volumes:
    mongodb_data:

## 📡 API Endpoints

| Method | Endpoint             | Description                  |
| ------ | -------------------- | ---------------------------- |
| GET    | `/api/prices`        | Get all stored price entries |
| GET    | `/api/prices/today`  | Get prices for today         |
| GET    | `/api/prices/latest` | Get the most recent price    |

## ⏰ Scheduler

The app uses a cron scheduler to fetch prices at set times.
You can customize it in scheduler.js using [node-cron](https://www.npmjs.com/package/node-cron) syntax.

## 🐞 Development Notes

- Logs are shown in the terminal.
- Use console.log() for debugging.
- Add additional .env keys as needed (e.g., API keys).