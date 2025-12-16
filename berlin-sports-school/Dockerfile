# Use a lightweight Nginx image
FROM nginx:alpine

# Copy your static files (html, css, js) to the Nginx server directory
COPY . /usr/share/nginx/html

# Configure Nginx to listen on port 8080 (Required by Cloud Run)
RUN sed -i 's/listen       80;/listen       8080;/g' /etc/nginx/conf.d/default.conf

# Expose port 8080
EXPOSE 8080