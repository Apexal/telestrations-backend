# Telestrations Backend

[Documentation](http://docs.colyseus.io/)

This is the backend server for the Telestrations web game. It uses the Colyseus framework on a NodeJS server.

## Usage

```
npm start
```

## Structure

- `index.js`: main entry point, register an empty room handler and attach [`@colyseus/monitor`](https://github.com/colyseus/colyseus-monitor)
- `src/rooms/MyRoom.js`: game room handler for you to implement your logic
- `src/rooms/schema/*.js`: schemas used in your room's state
- `loadtest/example.js`: scriptable client for the loadtest tool (see `npm run loadtest`)
- `package.json`:
    - `scripts`:
        - `npm start`: runs `node index.js`
        - `npm run loadtest`: runs the [`@colyseus/loadtest`](https://github.com/colyseus/colyseus-loadtest/) tool for testing the connection, using the `loadtest/example.js` script.
- `tsconfig.json`: TypeScript configuration file

## Backend Structure
![SDD CRC Cards](https://user-images.githubusercontent.com/70707829/115317001-85d55500-a148-11eb-87dd-4ec587c9b60d.png)
This diagram above describes the responsibilities and collaboratiors each class has. It also describes the type of cohesion and coupling in each class. Types mentioned here are information cohesion which means each module performs independent, related and necessary functions. Data coupling is when two modules don't depend on each other but they have similar arguments passed in. 

![classdiagram (1) (1)](https://user-images.githubusercontent.com/70707829/115317215-fb412580-a148-11eb-9db5-b5777029c422.jpg)
This diagram displays the different classes and how they interact with each other. The diagram displays the projects internal software structure.

## License

MIT
