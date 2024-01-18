<h3>How to Setup Project</h3>
<ul>
  <li>At first install Express, bcrypt, express-validator, body-parser, knex, pg, jsonwebtoken, cors, dotenv using  npm i </li>
  <li>Install typeScript using npm install -g typeSrcipt</li>
  <li>install typeScript types using npm install -D typescript @types/node @types/express @types/body-parser @types/knex </li>
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
  // Configure Knex for PostgreSQL
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
  <li></li>
</ul>
