# Dictionary API

A Dockerized Nodejs server for fun.  

This server provides the api that [`dictionary-ui`](https://github.com/DerekSeverson/dictionary-ui) relies upon.  It interfaces with the [Oxford Dictionaries API](https://developer.oxforddictionaries.com/) in order to search for words and fetch definitions for the UI. 

## Demo

![Demo](https://raw.githubusercontent.com/DerekSeverson/dictionary-api/master/demo/usage.gif)

## Getting Started

There's a few things needed to get started.  

1. Download Node & npm:  https://nodejs.org/en/
2. Download Docker:  https://www.docker.com/get-docker

### Environment Variables

**IMPORTANT**: After pulling down the repository, make sure you create a `.env` file copying over the contents of the `.env.example` file in the project's root directory.  These hold the environment variables for configuring your server.  Then sign up for a free Oxford Dictionary Developer Account in order to get your `id` and `key` for authenticating with the Oxford API - https://developer.oxforddictionaries.com/.  Replace the `OXFORD_APP_ID` and `OXFORD_APP_KEY` variables with your new `id` and `key` given to you upon signup.  

### Usage 

There are two ways of getting the `dictionary-api` running on your local machine: running on your host machine or running from within a docker container - both are very easy!

#### Running on host machine

```
$ npm install
$ npm start
```

#### Running in docker container

```bash
$ npm run docker:start
```

