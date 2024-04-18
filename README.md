# Project Name

## Description

This project is a Nuxt.js application that utilizes caching for optimized performance.

## Features

- Caching for faster loading times
- Dynamic content updates
- Responsive design

## Getting Started

To get this project up and running locally, follow these steps:

### Prerequisites

- Node.js installed on your machine

### Installation

1. Clone the repository
   ```bash
   git clone git@github.com:Milenoi/nuxt-cache.git

2. Navigate to the project directory

   ```bash
   cd nuxt-cache

3. Get correct node version

   ```bash
   nvm i

4. Install dependencies

   ```bash
   yarn install

## Environment Variables

To set up the necessary environment variables for this project, create a `.env` file in the project root directory and
add the following variables:

NUXT_NASA_API_KEY=YOUR_NASA_API_KEY [Get it here](https://developer.marvel.com/)<br>
NUXT_MARVEL_PUBLIC_API_KEY=YOUR_MARVEL_PUBLIC_API_KEY [Get it here](https://api.nasa.gov)<br>
NUXT_MARVEL_SECRET_API_KEY=YOUR_MARVEL_SECRET_API_KEY [Get it here](https://api.nasa.gov)<br>
NUXT_REDIS_PASSWORD=YOUR_REDIS_PASSWORD [Get it here](https://app.redislabs.com/)<br>
NUXT_REDIS_PORT=YOUR_REDIS_PORT [Get it here](https://app.redislabs.com/)<br>
NUXT_REDIS_HOST=YOUR_REDIS_HOST [Get it here](https://app.redislabs.com/)<br>
NUXT_REDIS_USERNAME=YOUR_REDIS_USERNAME [Get it here](https://app.redislabs.com/)

### Development

1. Start the development server

   ```bash
   yarn dev

Open your browser and access the application at http://localhost:3000

### Production Build

1. Generate a production build

   ```bash
   yarn build

2. Start the production server

   ```bash
   yarn start

### Visit Website

The website is currently hosted on Netlify

https://nuxt-cache-project.netlify.app/

### Contribution

Feel free to contribute by opening a pull request. Please follow the project's code of conduct.

### License

This project is licensed under the MIT License - see the LICENSE.md file for details.
