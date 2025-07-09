# Use an official Node.js runtime as the base image
FROM node:latest

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if using npm)
COPY package*.json ./

# Install app dependencies
RUN npm install --legacy-peer-deps
RUN npm ci --ignore-scripts

# Copy the rest of the app's source code
COPY . .

# Build the React app (replace "build" with your actual build command)
RUN npm run build

# Specify the command to run the app (for example, if using serve)
CMD ["npx", "serve", "-s", "build"]

EXPOSE 3000

#test
#docker build -t brain-search:latest .
#docker run -p 8080:3000 brain-search:latest

# docker tag brain-search burni720/brain-search:latest
# docker push burni720/brain-search:latest