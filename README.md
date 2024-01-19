<h1>Music Library System API initial setup and run Procedure</h1>
<h3>How to Setup Project</h3>
<ul>
  <li>
    Create Project dir: <p>mkdir music-library-system</p><p>cd music-library-system</p>
</li>
  <li>Create Package.json file <p>npm init -y
</p></li>
  
  <li>At first install Express, bcrypt, express-validator, body-parser, knex, pg, jsonwebtoken, cors, dotenv using  npm i </li>
  <li>Install typeScript using npm install -g typeSrcipt</li>
  <li>Install typeScript types using npm install -D typescript @types/node @types/express @types/body-parser @types/knex </li>
  <li>By using npx tsc --init create tsconfig.js file and comment out outDir and set ./dist</li>
  <li>Create src folder and index.ts file this file have server releted work</li>
  <li>In package.json set main: src/index.js</li>
  <li>In package.json do this change:
<p>
    "scripts": {
    "build": "npx tsc",
    "start": "node dist/index.js",
    "dev": "nodemon src/index.ts",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
</p>
  </li>
  <li>connect PostgreSQL with Express JS:
<p>
 <h6>
    // Configure Knex for PostgreSQL
 </h6>
    const db = Knex({
      client: 'pg',
      connection: {
        host: "localhost",
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: "music_library",
      },
      debug: true,  
      useNullAsDefault: true, 
});
</p></li>
  <li>Created .env and .gitignore. In .gitignore file where add node_modules and .env</li>
  <li>Install ts-node</li>
</ul>
<h3>Run the Project using npm run dev</h3>


<h1>Music Library System API Endpoints</h1>
<p>Here's a detailed breakdown of the main API endpoints for your music library system:</p>

<h5>User Endpoints:</h5>
<ul>
  <li>
   POST /register: Takes username, email, and password (hashed) to register a new user.</li>
  <li>POST /login: Takes username and password to authenticate and return a JWT token on success.</li>
</ul>

<h5>Album Endpoints:</h5>

<ul>
  <li>POST /albums: Protected endpoint to create a new album, requires title, release_year, and genre in the body.</li>
  <li>GET /albums: Retrieves all albums.</li>
  <li>GET /albums/:id: Retrieves an album by its ID.</li>
  <li>PUT /albums/:id: Protected endpoint to update an album by its ID, requires relevant fields in the body.</li>
  <li>
DELETE /albums/:id: Protected endpoint to delete an album by its ID.</li>
</ul>
<h5>Artist Endpoints:</h5>
<ul>
  <li>POST /artists: Protected endpoint to create a new artist, requires name in the body.</li>
  <li>GET /artists: Retrieves all artists.</li>
  <li>PUT /artists/:id: Protected endpoint to update an artist by its ID, requires relevant fields in the body.</li>
  <li>DELETE /artists/:id: Protected endpoint to delete an artist by its ID.</li>
 
</ul>
<h5>Song Endpoints:</h5>
<ul>
  <li>
POST /songs: Protected endpoint to create a new song, requires title, duration, and album_id in the body.</li>
  <li>GET /songs: Retrieves all songs, optionally filter by album_id or artist_id.</li>
</ul>

 
 
