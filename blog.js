const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'my_database.db');
const db = new sqlite3.Database(dbPath);

module.exports = db;

// models/User.js
const db = require('../db');

const createUserTable = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT,
      email TEXT
    )
  `);
};

const insertUser = (username, email) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('INSERT INTO users (username, email) VALUES ('sai', 'sai@gmail.com')');
    stmt.run(username, email, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
    stmt.finalize();
  });
};

const getAllUsers = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM users', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

module.exports = { createUserTable, insertUser, getAllUsers };

// models/Blog.js
const db = require('../db');

const createBlogTable = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS blogs (
      id INTEGER PRIMARY KEY,
      title TEXT,
      content TEXT,
      user_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
};

const insertBlog = (title, content, userId) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('INSERT INTO blogs (title, content, user_id) VALUES ('First Blog', 'this is my first blog', 1)');
    stmt.run(title, content, userId, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
    stmt.finalize();
  });
};

const getAllBlogs = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM blogs', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

module.exports = { createBlogTable, insertBlog, getAllBlogs };


// models/Comment.js
const db = require('../db');

const createCommentTable = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY,
      content TEXT,
      user_id INTEGER,
      blog_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (blog_id) REFERENCES blogs(id)
    )
  `);
};


const insertComment = (content, userId, blogId) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('INSERT INTO comments (content, user_id, blog_id) VALUES ('Great blog!!', 1, 1)');
    stmt.run(content, userId, blogId, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
    stmt.finalize();
  });
};

const getAllComments = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM comments', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

module.exports = { createCommentTable, insertComment, getAllComments };

// routes/users.js
const express = require('express');
const router = express.Router();
const { insertUser, getAllUsers } = require('../models/User');

router.get('/', async (req, res) => {
  const users = await getAllUsers();
  res.json(users);
});

router.post('/', async (req, res) => {
  const { username, email } = req.body;
  const userId = await insertUser(username, email);
  res.status(201).json({ id: userId, username, email });
});

module.exports = router;

// routes/blogs.js
const express = require('express');
const router = express.Router();
const { insertBlog, getAllBlogs } = require('../models/Blog');

router.get('/', async (req, res) => {
  const blogs = await getAllBlogs();
  res.json(blogs);
});

router.post('/', async (req, res) => {
  const { title, content, userId } = req.body;
  const blogId = await insertBlog(title, content, userId);
  res.status(201).json({ id: blogId, title, content, userId });
});

module.exports = router;

// routes/comments.js
const express = require('express');
const router = express.Router();
const { insertComment, getAllComments } = require('../models/Comment');

router.get('/', async (req, res) => {
  const comments = await getAllComments();
  res.json(comments);
});

router.post('/', async (req, res) => {
  const { content, userId, blogId } = req.body;
  const commentId = await insertComment(content, userId, blogId);
  res.status(201).json({ id: commentId, content, userId, blogId });
});

module.exports = router;

// server.js
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();

// Middleware
app.use(bodyParser.json());

// Define routes
app.use('/users', require('./routes/users'));
app.use('/blogs', require('./routes/blogs'));
app.use('/comments', require('./routes/comments'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));