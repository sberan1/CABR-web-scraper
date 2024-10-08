# Use the official Node.js 14 image as a base
FROM node:lts

# Set the working directory in the Docker image
WORKDIR /usr/src/app

# Copy package.json and package-lock.json into the image
COPY package*.json ./

# Install dependencies in the image
RUN npm install

# Copy the rest of the application files into the image
COPY . .

# Define build arguments for environment variables
ARG LOGIN
ARG PASSWORD

# Set environment variables
ENV LOGIN=$LOGIN
ENV PASSWORD=$PASSWORD

# Expose port 3134
EXPOSE 3134

# Start the application
CMD [ "node", "index.js" ]
