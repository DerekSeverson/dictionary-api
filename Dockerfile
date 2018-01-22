
FROM node:8.4

# set our node environment, either development or production
# defaults to production, compose overrides this to development on build and run
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# default to port 3000 for node, and 5858 or 9229 for debug
ARG PORT=3000
ENV PORT $PORT
EXPOSE $PORT 5858 9229

# check every 30s to ensure this service returns HTTP 200
HEALTHCHECK CMD curl -fs http://localhost:$PORT/health || exit 1

# install dependencies first, in a different location for easier app bind mounting for local development
WORKDIR /usr/src/app
COPY package.json package-lock.json index.js ./
RUN npm install --quiet
ENV PATH ./node_modules/.bin:$PATH
ENV NODE_PATH .:./src

# copy in our source code last, as it changes the most
COPY src src

CMD ["node", "index.js"]
