# ------------------------------------
# BUILD STAGE
# ------------------------------------

FROM node:22-alpine AS build

WORKDIR /app

# Install pnpm
RUN npm i -g pnpm@10.12.1

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile

# Copy source files and build
COPY . ./
ENV ASTRO_TELEMETRY_DISABLED=1
RUN pnpm build

# ------------------------------------
# RUN STAGE
# ------------------------------------

FROM nginx:1.27-alpine AS runtime

# Copy built files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
