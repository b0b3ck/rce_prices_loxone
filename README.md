# ⚡ RCE Prices to Loxone

This project fetches electricity prices (e.g., from PSE) and makes them accessible via a simple REST API for use with [Loxone](https://www.loxone.com/) smart home systems or any automation controller.

---

## 🚀 Features

- Fetches current electricity prices on a schedule (curent setup is 14:00 as usually at this time prices for the next day are available)
- Stores data in MongoDB
- REST API to expose price data. Data for Loxoe are exposed in relative way as below:
    ```
    "hour +00": {
        "value": 0.424,
        "hour": "00:00"
    },
    "hour +01": {
        "value": 0.421,
        "hour": "01:00"
    },
    ```
- Node.js + Express + Mongoose-based
- Easy to deploy locally or via Docker

---

## 📁 Project Structure

```text
rce_prices_loxone/
├── server.js                  # Main app entry point
├── routes/
│   └── allPrices.js           # API route for serving all prices
│   └── energy.js              # API route for serving relative prices for Loxone
├── services/
│   └── fetchPrices.js         # Logic for fetching and processing PSE price data
├── models/
│   └── EnergyPrice.js         # Mongoose schema for price entries
├── .env.example               # Example environment configuration file
├── package.json               # Project dependencies and scripts
├── package-lock.json          # Exact dependency versions
├── Dockerfile                 # Docker configuration for building the app image
└── docker-compose.yml         # Docker Compose setup for app + MongoDB
```
## ⚙️ Requirements

- Node.js 18+ (recommended: Node 20 or 24)
- MongoDB 6+
- Internet access to fetch data from PSE API

## 🛠 Installation

1. Clone the Repo
    ```bash
    git clone https://github.com/b0b3ck/rce_prices_loxone.git
    cd rce_prices_loxone
    ```
2. Create and Configure .env\
Copy the example:
    ```bash
    cp .env.example .env
    ```
    Then update the values in .env:
    ```env
    MONGO_URI=mongodb://localhost:27017/rce_prices
    PSE_API_BASE=https://your-api-url
    ```
3. Install Dependencies
    ```bash
    npm install
    ```
4. Start the Server
    ```bash
    npm start
    ```
    Visit: http://localhost:3000

## 🐳 Docker Deployment
Use the following Docker Compose setup:
```yaml
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
```

## 📡 API Endpoints

| Method | Endpoint             | Description                  |
| ------ | -------------------- | ---------------------------- |
| GET    | `/api/all-prices`    | Get all stored price entries |
| GET    | `/api/api/energy  `  | Get prices for today         |
| GET    | `/api/prices/latest` | Get the most recent price    |

## ⏰ Scheduler

The app uses a cron scheduler to fetch prices at set times.
You can customize it in scheduler.js using [node-cron](https://www.npmjs.com/package/node-cron) syntax.

## 🐞 Development Notes

- Logs are shown in the terminal.
- Use console.log() for debugging.
- Add additional .env keys as needed (e.g., API keys).

## 📃 License

MIT © [b0b3ck](https://github.com/b0b3ck)