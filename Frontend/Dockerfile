# Build stage
FROM node:18 AS build
WORKDIR /app

# Set platform to linux/x64
ENV PLATFORM=linux
ENV ARCH=x64

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm cache clean --force && \
    npm ci --platform=linux --arch=x64 && \
    npm install @rollup/rollup-linux-x64-gnu

# Copy all source files
COPY . .

# Build the application
ENV NODE_ENV=production
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]