# Disinfectant-Backend

## Project Overview

This is a Node.js based Backend project designed for building scalabale and maintainable API services. It supports local development and production environments, with Docker integration for containerisation and MongoDB for data persistence.

Core delivery platform Node.js Backend Template.

- [Requirements](#requirements)
  - [Node.js](#nodejs)
- [Local development](#local-development)
  - [Setup](#setup)
  - [Development](#development)
  - [Production](#production)
  - [Npm scripts](#npm-scripts)
- [API endpoints](#api-endpoints)
- [Calling API endpoints](#calling-api-endpoints)
  - [Postman](#postman)
- [Docker](#docker)
  - [Development Image](#development-image)
  - [Production Image](#production-image)
- [Licence](#licence)
  - [About the licence](#about-the-licence)

## Requirements

### Node.js

Please install [Node.js](http://nodejs.org/) `>= v18` and [npm](https://nodejs.org/) `>= v9`. You will find it
easier to use the Node Version Manager [nvm](https://github.com/creationix/nvm)

To use the correct version of Node.js for this application, via nvm:

```bash
cd disinfectant-backend
nvm use
```

## Local development

### Setup Instructions

#### Cloning the Repository

To set up the project locally on your machine, follow these steps:

1. open your terminal or command prompt.
2. Navigate to the directory where you'd like to clone the project.
3. Run the following `git` command to the clone repository:

```bash
git clone https://github.com/DEFRA/disinfectant-backend.git
```

4. After cloning the repository, navigate to the project folder:

```bash
cd disinfectant-backend
```

> ⚠️
> Please make sure you have the appropriate Node.js and npm packages installed. For more details, please consult the section above titled `Requirements`.

#### Installing Dependencies

Install application dependencies:

```bash
npm install
```

#### Running the Application

To run the application in `development` mode run:

```bash
npm run dev
```

#### Testing

To test the application run:

```bash
npm run test
```

#### Production

To mimic the application running in `production` mode locally, run:

```bash
npm start
```

#### Npm scripts

All available Npm scripts can be seen in [package.json](./package.json)
To view them in your command line run:

```bash
npm run
```

## API endpoints

| Endpoint             | Description                    |
| :------------------- | :----------------------------- |
| `GET: /health`       | Health                         |
| `GET: /example    `  | Example API (remove as needed) |
| `GET: /example/<id>` | Example API (remove as needed) |

## Calling API endpoints

### Postman

A [Postman](https://www.postman.com/) collection and environment are available for making calls to the disinfectant-backend API.
Simply import the collection and environment into Postman.

- [CDP Node Backend Template Postman Collection](postman/disinfectant-backend.postman_collection.json)
- [CDP Node Backend Template Postman Environment](postman/disinfectant-backend.postman_environment.json)

## Development helpers

### MongoDB Locks

If you require a write lock for Mongo you can acquire it via `server.locker` or `request.locker`:

```javascript
async function doStuff(server) {
  const lock = await server.locker.lock('unique-resource-name')

  if (!lock) {
    // Lock unavailable
    return
  }

  try {
    // do stuff
  } finally {
    await lock.free()
  }
}
```

Keep it small and atomic.

You may use **using** for the lock resource management.
Note test coverage reports do not like that syntax.

```javascript
async function doStuff(server) {
  await using lock = await server.locker.lock('unique-resource-name')

  if (!lock) {
    // Lock unavailable
    return
  }

  // do stuff

  // lock automatically released
}
```

Helper methods are also available in `/src/helpers/mongo-lock.js`.

## Docker

### Development image

Build:

```bash
docker build --target development --no-cache --tag disinfectant-backend:development .
```

Run:

```bash
docker run -e GITHUB_API_TOKEN -p 3008:3008 disinfectant-backend:development
```

### Production image

Build:

```bash
docker build --no-cache --tag disinfectant-backend .
```

Run:

```bash
docker run -e GITHUB_API_TOKEN -p 3001:3001 disinfectant-backend
```

### Docker Compose

A local environment with:

- Localstack for AWS services (S3, SQS)
- Redis
- MongoDB
- This service.
- A commented out frontend example.

```bash
docker compose up --build -d
```

## Contributing

If a need to alter/add code to this project arises, please follow the steps below to contribute:

1. Make sure you have cloned the repository as shown in the `Setup Instructions` above.
2. Create a new branch with a descriptive name:

```bash
git checkout -b feature/new-feature-name
```

3. Make your changes.
4. Before committing your code, please ensure that your code is properly formatted and free of linting errors. Run the following commands in your code editor terminal in the respective order:

```bash
npm run format
```

```bash
npm run lint
```

Address any issues that may have been flagged 5. Commit your changes:

```bash
git commit -m "describe what you have done"
```

6. Submit a pull request and describe your changes

7. Once your code has been reviewed and tested, it will be ready to push to the main branch

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
