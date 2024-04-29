const cookieSession = require("cookie-session");
const express = require("express");
const app = express();
const port = 4001;
const passport = require("passport");
const passportSetup = require("./config/passport-setup");
const mongoose = require("mongoose");
const keys = require("./config/keys");
//const cors = require("cors");
const cookieParser = require("cookie-parser"); // parse cookie header

// connect to MongoDB
mongoose.connect(keys.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
}, () => {
  console.log("Connected to MongoDB");
});

// Trust the first proxy
app.set('trust proxy', 1);

// Session configuration with secure cookies
app.use(cookieSession({
  name: "session",
  keys: [keys.COOKIE_KEY],
  maxAge: 24 * 60 * 60 * 1000, // Cookie expiry set in milliseconds
  secure: true, // Secure cookies, transmitted over HTTPS only
  httpOnly: true, // The cookie is only accessible by the web server
  sameSite: 'lax' // CSRF protection
}));

// Parse cookies
app.use(cookieParser());

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());


/*
const corsOptions = {
  origin: "https://dapp.dailytelos.net", // This should match the domain of your frontend app
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ['Authorization', 'Content-Type', 'Access-Control-Allow-Credentials'],
  credentials: true, // Crucial for cookies to be included
  preflightContinue: false, // Preflight response is handled by the CORS middleware
  optionsSuccessStatus: 204 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};
*/

//app.use(cors(corsOptions));


//app.options('*', cors(corsOptions));


// Set up authentication routes
const authRoutes = require("./routes/auth-routes");
app.use("/auth", authRoutes);

// Middleware to check user authentication
const authCheck = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({
      authenticated: false,
      message: "User has not been authenticated"
    });
  } else {
    next();
  }
};

// Authenticated route example
app.get('/', authCheck, (req, res) => {
  res.status(200).json({
    authenticated: true,
    message: "User successfully authenticated",
    user: req.user,
    cookies: req.cookies
  });
});

// API route to check if server is online
app.get("/api/status", (req, res) => {
  res.status(200).send("Server online");
});

// Start the server
app.listen(port, () => console.log(`Server is running on port ${port}!`));
