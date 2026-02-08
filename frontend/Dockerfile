# 1. Use Node alpine
FROM node:20-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy package files
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy source code
COPY . .

# 6. Expose the standard Vite port
EXPOSE 5173

# 7. Start the app with --host to expose it to the network
CMD ["npm", "run", "dev", "--", "--host"]