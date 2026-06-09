# This Dockerfile is for local development only.
# For production, deploy as a Render Static Site:
#   Build Command: npm run build
#   Publish Directory: build
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
