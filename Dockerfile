# Use lightweight Node.js Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies (node_modules not copied)
RUN npm ci --omit=dev

# Copy the rest of your app
COPY . .

# Optional: Set NODE_ENV to production
ENV NODE_ENV=production

# Expose port if you're running an API/server
EXPOSE 3030

# Start the app (adjust if your entry point differs)
CMD ["node", "server.js"]
