// Import required modules
import express, { Request, Response, NextFunction, response } from 'express';
import * as bodyParser from 'body-parser';
import Knex, { knex } from 'knex';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { check, validationResult } from 'express-validator';
require('dotenv').config();
const PORT = process.env.PORT || 3000;


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
// Add this line before defining your routes
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
    const accessToken = jwt.sign({ username: user.username }, secretKey, { expiresIn: '5hr' });

    return res.json({accessToken});

  }
  else{
    return res.sendStatus(401);
  }
})
app.post('/albums', verifyToken, async (req, res) => {
  try {
    const { title, release_year, genre, artist_ids } = req.body;

    const album = await db('albums').insert({
      title,
      release_year,
      genre,
    });

    const albumId = album[0];

    if (artist_ids) {
      await db('album_artists').insert(
        artist_ids.map((artistId: number) => ({ album_id: albumId, artistId })) // Corrected line
      );
    }

    res.json({ id: albumId, title, release_year, genre });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create album' });
  }
});

// ... other imports and code ...

// Get all albums
app.get('/albums', async (req, res) => {
  try {
    const albums = await db('albums').select('*');
    res.json(albums);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve albums' });
  }
});

// Get a specific album by ID
app.get('/albums/:id', async (req, res) => {
  const albumId = req.params.id;
  try {
    const album = await db('albums').where({ id: albumId }).first();
    if (album) {
      res.json(album);
    } else {
      res.status(404).json({ message: 'Album not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve the album' });
  }
});

// Update an album by ID
app.put('/albums/:id', verifyToken, async (req, res) => {
  const albumId = req.params.id;
  const { title, release_year, genre, artist_ids } = req.body;

  try {
    await db('albums').where({ id: albumId }).update({
      title,
      release_year,
      genre,
    });

    // Delete existing relationships
    await db('album_artists').where({ album_id: albumId }).del();

    // Insert new relationships
    if (artist_ids) {
      await db('album_artists').insert(
        artist_ids.map((artistId: number) => ({ album_id: albumId, artistId }))
      );
    }

    res.json({ id: albumId, title, release_year, genre });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update the album' });
  }
});

// Delete an album by ID
app.delete('/albums/:id', verifyToken, async (req, res) => {
  const albumId = req.params.id;

  try {
    await db('album_artists').where({ album_id: albumId }).del(); // Delete associated artists
    await db('albums').where({ id: albumId }).del(); // Delete the album
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete the album' });
  }
});
// ................Artists Starts
// Create a new artist
app.post('/artists', verifyToken, async (req, res) => {
  const { name} = req.body;

  try {
    const artist = await db('artists').insert({
      name,
    
    });

    res.json({ id: artist[0], name});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create artist' });
  }
});
// Get all artists
app.get('/artists', async (req, res) => {
  try {
    const artists = await db('artists').select('*');
    res.json(artists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve artists' });
  }
});
// update 
app.put('/artists/:id', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;

    await db('artists').where({ id: req.params.id }).update({ name });

    res.json({ message: 'Artist updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update artist' });
  }
});


// ... other routes and code ...
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
