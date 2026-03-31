# 🏆 StreetLeague Frontend - Esprit PI 2026

![Angular](https://img.shields.io/badge/Angular-18.2-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

Welcome to the *StreetLeague* frontend repository. This project is a comprehensive sports management platform developed for the Esprit PI (Projet Intégré) 2026. It provides a modern, high-performance interface for players, captains, and owners to manage teams, venues, and transactions.

---

## ✨ Features

StreetLeague is divided into several modules, each offering a rich set of functionalities:

### 👥 Teams Management
- *Interactive Listing*: Explore all available teams with sport-specific icons and banners.
- *Full CRUD*: Create and edit teams (including logo upload).
- *Joining System*: Send and manage join requests or team invitations.
- *Team Leadership*: Transfer captain rights to other members or manage team rosters.

### 🏟️ Venues & Reservations
- *Venue Browser*: Discover sports facilities with detailed information.
- *Booking*: Reserve venues for matches and training sessions (Owner/Member views).

### 💰 Wallet & Economy
- *Transactions*: View history and manage digital currency balances.
- *Integration*: Secure payment flows for league fees and merchandise.

### 🛒 Shop & Merchandise
- *Merchandise*: Purchase gear, equipment, and personalized apparel.
- *Sponsors*: Direct interaction and visibility for league partners.

### 🚗 Carpooling
- *Logistics*: Organize transportation for team members to venues.
- *Coordination*: Create or join carpooling sessions for upcoming matches.

### 🏥 Health & Wellness
- *Tracking*: Monitor player health status and injury reports.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [Angular CLI](https://angular.io/cli) (v18.x)

### Installation
1.  *Clone the repository*:
    
    git clone https://github.com/Feryel-Lassili/Esprit-PI-4SE3-2026-StreetLeague-Frontend.git
    cd Esprit-PI-4SE3-2026-StreetLeague-Frontend
    
2.  *Install dependencies*:
    
    npm install
    
3.  *Start the development server*:
    
    npm start
    
    Access the application at http://localhost:4200/.

---

## 🛠️ Technology Stack

- *Core*: Angular 18 (Standalone Components / RxJS)
- *Styling*: Vanilla SCSS (Custom Premium Design System) + TailwindCSS
- *Animations*: Angular Animations & Custom Keyframes
- *Forms*: Reactive & Template-driven forms
- *Icons*: Custom SVG & Sport Symbols

---

## 📁 Project Structure

text
src/
├── app/
│   ├── core/           # Services (Auth, Team, API interceptors)
│   ├── features/       # Main application modules
│   │   ├── auth/       # Registration & Login
│   │   ├── backoffice/ # Admin dashboards
│   │   ├── frontoffice/# User platform (Home, Teams, Wallet...)
│   │   └── shared/     # Global reusable components
│   └── assets/         # Static images, fonts, icons
├── styles.scss         # Global styles & design tokens

---

## 🎨 UI/UX Design

StreetLeague features a *Premium Modern Interface*:
- *Dynamic Gradients*: Color-coded sports themes (Football: Green, Basketball: Orange, etc.).
- *Micro-animations*: Subtle hover effects and smooth transitions (Glassmorphism).
- *Responsive Web Design*: Optimized for Desktop and Mobile experiences.

---

## 📄 License
This project is part of the Esprit University Academic curriculum. All rights reserved.
ANGULAR: 18.2