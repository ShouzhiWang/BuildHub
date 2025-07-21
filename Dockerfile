# Use official Node image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Configure npm for better reliability
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Install dependencies with retry logic
RUN npm install --no-optional --prefer-offline || \
    (sleep 10 && npm install --no-optional --prefer-offline) || \
    (sleep 20 && npm install --no-optional --prefer-offline)

# Copy the rest of the app
COPY . .

# Expose port (Vite default is 5173)
EXPOSE 5173

# Start the dev server with host binding for Docker
CMD ["npm", "run", "dev"]