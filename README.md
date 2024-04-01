# Vue-SSR

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![CircleCI](https://dl.circleci.com/status-badge/img/gh/e-xode/vue-ssr/tree/master.svg?style=svg&circle-token=d8353b320a36159da949b935eba5cbdb41502a60)](https://dl.circleci.com/status-badge/redirect/gh/e-xode/vue-ssr/tree/master) [![Coverage Status](https://coveralls.io/repos/github/e-xode/vue-ssr/badge.svg?branch=master)](https://coveralls.io/github/e-xode/vue-ssr?branch=master) ![NPM Version](https://img.shields.io/npm/v/%40e-xode%2Fvue-ssr?color=green)

@e-xode/vue-ssr is a "ready to dev" setup for any new vue application requiring [SSR](https://vuejs.org/guide/scaling-up/ssr.html) rendering.

## features
- user login, registration, account pages
- mongodb database integration
- socket.io for client / server communication
- minimalist online shop
- content management system and administration interface
- database schema is fully defined by application json files

## powered by
- [Vue 3](https://vuejs.org/) as Frontend and SSR renderer
- [Vui](https://vui.e-xode.net/) a rich vue web components
- [Vite](https://vitejs.dev/) as middleware for app development and building
- Http and [socket.io](https://socket.io//) for client / server interaction
- [MongoDB](https://cloud.mongodb.com/) cloud connexion (or local mongo container )
- [Docker](https://www.docker.com/) for local development and deployment

## Get started
```sh
cp .env_sample .env
```
- edit .env file and update with your node, mongo, smtp variables

Then to run application:

```sh
docker-compose up
```
