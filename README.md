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


## License

MIT
