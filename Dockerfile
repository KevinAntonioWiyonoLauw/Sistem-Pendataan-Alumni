FROM node:25

# Install dependencies
RUN apk update && apk add --no-cache \
    build-base \
    gcc \
    autoconf \
    automake \
    zlib-dev \
    libpng-dev \
    vips-dev \
    git

WORKDIR /opt/app

# Install Strapi CLI globally
RUN npm install -g create-strapi-app@latest

# Create init script that auto-generates Strapi if not exists
RUN echo '#!/bin/sh\n\
set -e\n\
\n\
if [ ! -f "/opt/app/package.json" ]; then\n\
  echo "================================="\n\
  echo "Generating new Strapi project..."\n\
  echo "================================="\n\
  npx create-strapi-app@latest /opt/app \\\n\
    --no-run \\\n\
    --skip-cloud\n\
  \n\
  echo "Installing dependencies..."\n\
  cd /opt/app\n\
  yarn install\n\
else\n\
  echo "Strapi project found, checking dependencies..."\n\
  yarn install\n\
fi\n\
\n\
echo "================================="\n\
echo "Starting Strapi development server..."\n\
echo "================================="\n\
yarn develop' > /opt/init.sh && chmod +x /opt/init.sh

# Expose port
EXPOSE 1337

# Start Strapi via init script
CMD ["/opt/init.sh"]