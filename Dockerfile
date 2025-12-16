# ----------------------------
# Stage 1: Build the app
# ----------------------------
FROM node:22-alpine as build

# Set the working directory
WORKDIR /app

# Copy package info and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code and build the Vite app
COPY . .
RUN npm run build

# ----------------------------
# Stage 2: Serve the app with Nginx
# ----------------------------
FROM nginx:alpine

# Copy the built files (from the 'dist' folder) to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Configure Nginx to listen on port 8080 (Required for Cloud Run)
RUN sed -i 's/listen       80;/listen       8080;/g' /etc/nginx/conf.d/default.conf

# Expose port 8080
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
