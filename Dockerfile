# Use an official Node.js runtime as a parent image
FROM node:21-alpine3.18

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies including dev dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

RUN npx prisma generate

# Build the application
RUN npm run build


RUN npm prune --production

EXPOSE 4000
# Set the command to start the application
CMD ["npm", "run", "start:prod"]
