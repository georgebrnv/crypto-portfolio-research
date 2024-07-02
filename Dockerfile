FROM node:17

# Working Dir
WORKDIR /usr/src/app

# Copy Package Json Files
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy local code to the container image.
COPY . .

# Run the web service on container startup.
CMD [ "node", "src/app.js" ]

# Expose the port the app runs on
EXPOSE 3000