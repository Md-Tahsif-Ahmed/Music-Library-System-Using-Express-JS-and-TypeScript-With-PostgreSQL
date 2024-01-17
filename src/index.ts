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
// Middleware to validate JWT
const verifyToken = (req: Request, res: Response, next: NextFunction)=>{
  const token = req.header('Authorization');
  if(!token){
    return res.sendStatus(401)
  }
  jwt.verify(token, secretKey, (err:any, user:any)=> {
    if(err){
      return res.sendStatus(403);
      
    }
    (req as AuthenticatedRequest).user = user;
      next();
  })
}

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
    const accessToken = jwt.sign({ username: user.username}, secretKey);
    return res.json({accessToken});

  }
  else{
    return res.sendStatus(401);
  }


})

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
