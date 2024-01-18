// Import required modules
import express, { Request, Response, NextFunction, response } from 'express';
import * as bodyParser from 'body-parser';
import Knex, { knex } from 'knex';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { check, validationResult } from 'express-validator';
require('dotenv').config();


console.log(process.env.DB_USER);
console.log(process.env.DB_PASS);
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

const app = express();
app.use(bodyParser.json());
// JWT Secret Key
const secretKey = process.env.SECRET_KEY || 'defaultSecretKey'
console.log(secretKey);

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization');

  console.log('Token:', token);

  if (!token) {
    console.log('No token provided');
    return res.sendStatus(401);
  }

  jwt.verify(token.split(' ')[1], secretKey, (err, decoded) => {
    if (err) {
      console.error('Token Verification Error:', err);
      return res.status(401).send({ message: 'unauthorized access' });
    }

    console.log('Decoded Token:', decoded);
    (req as AuthenticatedRequest).user = decoded;
    next();
  });
};




interface AuthenticatedRequest extends Request {
  user?: any; // Here adjust the type of 'user' as needed
}

// user register api endpoit
app.post('/register', [
  check('username').isLength({ min: 5 }),
  check('password').isLength({ min: 8 }),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, password } = req.body;

    // Ensure 'password' is defined
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user data into the "users" table
    await db('users').insert({ password_hash: passwordHash, username: username });

    res.sendStatus(201);
  } catch (error: any) {
    console.error('Error during registration:', error);
    console.error(error.stack);   
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// user login with token based
app.post('/login', async (req:Request, res:Response)=>{
  const {username, password} = req.body;
  const user = await db('users').where({username}).first();
  if(user && await bcrypt.compare(password, user.password_hash)){
    const accessToken = jwt.sign({ username: user.username }, secretKey, { expiresIn: '1hr' });

    return res.json({accessToken});

  }
  else{
    return res.sendStatus(401);
  }
})

// Create albums
// app.post('/albums', async (req:Request, res:Response)=>{
//  const {title, release_year,genre, artists} = req.body;

// })
app.post('/albums', verifyToken, async (req, res) => {
  console.log('Received Token:', req.header('Authorization'));
  const { title, release_year, genre, artists } = req.body;

  // Insert album
  const [albumId] = await db('albums').insert({ title, release_year, genre }).returning('album_id');

  // Insert or fetch artists and associate with the album
  
if (Array.isArray(artists) && artists.length > 0) {
  const artistIds = await Promise.all(
    artists.map(async (artistName: string) => {
      const [artistId] = await db('artists').insert({ name: artistName }).returning('artist_id');
      return artistId;
    })
  );

  // ...

// Associate artists with the album
await db('album_artists').insert(
  artistIds.map((artistId) => ({ album_id: albumId, artist_id: artistId }))
);

// ...

}


  res.sendStatus(201);
});
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
