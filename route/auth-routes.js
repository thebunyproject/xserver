const router = require("express").Router();
const passport = require("passport");
const { createCalendar } = require("../modules/createCalendar");

// Update these URLs to reflect the deployed front-end URLs
const CLIENT_HOME_PAGE_URL = "https://dapp.dailytelos.net/x/";
const LOGOUT_URL = 'https://dapp.dailytelos.net/';

router.post("/create", async (req, res) => {
  try {
    const { inputName, inputVisibility } = req.body;

    await createCalendar(inputName, inputVisibility);
    res.status(200).json({ message: "Calendar created successfully" });
  } catch (error) {
    console.error('Error creating calendar:', error);
    res.status(500).json({ error: 'Failed to create calendar', message: error.message });
  }
});

router.get("/login/success", (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      message: "user has successfully authenticated",
      user: req.user,
      cookies: req.cookies
    });
  }
});

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "user failed to authenticate."
  });
});

// When logout, redirect to client
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(LOGOUT_URL);
});


// auth with twitter
router.get("/twitter", passport.authenticate("twitter"));

router.get("/twitter/redirect", passport.authenticate("twitter", {
    successRedirect: CLIENT_HOME_PAGE_URL,
    failureRedirect: "/auth/login/failed"
}));

module.exports = router;
