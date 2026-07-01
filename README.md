# RailLens Frontend

RailLens Frontend is a modern Next.js application for exploring Indian Railways. It allows users to search trains, browse station information, and discover trains running between two stations through a clean and responsive interface.

## Tech Stack

* Next.js 16
* React 19
* TypeScript
* Tailwind CSS
* Lucide React

## Features

* Train Search
* Train Details
* Station Details
* Trains Between Stations
* Station Autocomplete
* Journey Timeline
* Responsive UI

## Project Structure

```
app/
components/
services/
types/
public/
```

Key component groups:

```
components/
├── home
├── journey
├── layout
├── search
├── station
├── train
└── ui
```

## Getting Started

### Prerequisites

* Node.js 20+
* npm

### Install Dependencies

```bash
npm install
```

### Configure Backend

Ensure the Spring Boot backend is running on:

```
http://localhost:8080
```

Update the API base URL if required.

### Start Development Server

```bash
npm run dev
```

The application will be available at:

```
http://localhost:3000
```

## Pages

| Route                     | Description             |
| ------------------------- | ----------------------- |
| `/`                       | Home                    |
| `/trains/[trainNumber]`   | Train Details           |
| `/stations/[stationCode]` | Station Details         |
| `/journeys`               | Trains Between Stations |

## UI Components

Reusable components include:

* Navbar
* Container
* Breadcrumb
* Card
* Button
* StationAutocomplete

Feature-specific components are organized separately for maintainability.

## Application Flow

```
Home
├── Train Search
│     └── Train Details
│            └── Station Details
│
└── Journey Search
      └── Matching Trains
             └── Train Details
```

## Design Principles

* Railway functionality first
* Clean and consistent interface
* Reusable feature-specific components
* Minimal unnecessary abstraction

## Future Roadmap

* Station Search Page
* Favorites
* Recent Searches
* Dark Mode
* Shareable Train Links
* Live Running Status
* PNR Status
* Platform Information
* Seat Availability

## License

This project is intended for learning and personal development.