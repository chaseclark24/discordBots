# Discord Bots

A collection of Discord automation experiments built between 2019 and 2020 for community utilities, game-event reminders, polling, and data lookups.

> **Status:** Historical code collection. The bots target older Discord.js and third-party APIs and are not expected to run without modernization.

## Included projects

- `buffReposterBotV12.js` — reposted world-buff timers across Discord channels, managed one-time and recurring notifications, and logged activity to SQLite.
- `tsarBot.js` — combined reaction-based polls, raid and game-event timers, rankings, and community commands.
- `rollBot.js` — returned a random number for a user-supplied range.
- `onyBot.js` — calculated the next scheduled Onyxia reset.
- `cvBot.js` — queried a public COVID-19 API for summary information.
- `buffReposterBot.js` — an earlier iteration of the world-buff reposting bot.

## Technology

- Node.js
- Discord.js
- SQLite
- REST API integrations
- Event-driven message and reaction handlers

## Configuration

The original bots loaded tokens and channel settings from local JSON configuration files. Those private configuration files are intentionally not included.

To revive any bot, its dependencies, Discord.js event APIs, external data sources, and configuration handling would need to be updated first.

## Why this repository is retained

The code documents the evolution from small command handlers to a larger event-driven bot with persistence, retry handling, subscriptions, and operational logging.
