# Pusher

Pusher is a Next.js web application designed to help developers manage GitHub projects more easily. It provides a clean dashboard for viewing repositories, checking repository health, creating new repositories, and improving README documentation.

The project focuses on making GitHub project management faster and more organised by bringing useful repository tools into one simple interface.

## Project Overview

Pusher is built as a developer productivity dashboard. It allows users to connect with GitHub, view repository information, create new repositories, check the quality of existing repositories, and use a README helper to improve project documentation.

This project was created to practise full-stack web development concepts using Next.js, TypeScript, API routes, reusable components, and dashboard-based user interface design.

## Features

- GitHub authentication
- Dashboard interface
- Repository list view
- Repository health checker
- New repository creation
- README helper page
- Drop2Repo feature
- Settings page
- Responsive user interface
- Reusable UI components
- Clean and modern layout

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- GitHub API
- React Query
- ESLint
- Prettier

## Folder Structure

```text
Pusher/
├── app/
├── components/
├── lib/
├── public/
├── styles/
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
Installation

Clone the repository:

git clone https://github.com/sxhiru0725/Pusher.git

Go into the project folder:

cd Pusher

Install dependencies:

npm install
Environment Variables

Create a .env.local file in the root folder and add the required environment variables.

Example:

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

Do not upload your real .env or .env.local file to GitHub.

Running the Project

Start the development server:

npm run dev

Open the app in your browser:

http://localhost:3000
Build for Production
npm run build

Start the production build:

npm start
Purpose of the Project

The main purpose of this project is to create a useful developer tool while improving skills in:

Next.js application development
TypeScript
API integration
GitHub API usage
Authentication
Dashboard UI design
Component-based development
Project documentation
Future Improvements
Add more detailed repository analytics
Improve README generation with AI support
Add repository issue tracking
Add commit activity insights
Add user profile statistics
Improve error handling and loading states
Add more customisation options for users
Author

Developed by Sahiru Imadith.

GitHub: sxhiru0725