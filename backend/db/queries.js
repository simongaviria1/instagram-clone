const db = require("./index");
const authHelpers = require("../auth/helpers");
const passport = require("../auth/local");

function loginUser(req, res, next) {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        res.status(500).send("error while trying to log in");
      } else if (!user) {
        res.status(401).send("invalid username/password");
      } else if (user) {
        req.logIn(user, function(err) {
          if (err) {
            res.status(500).send("error");
          } else {
            res.status(200).send(user);
          }
        });
      }
    })(req, res, next);
}

function logoutUser(req, res, next) {
  req.logout();
  res.status(200).send("log out success");
}

function getAllPictures(req, res, next) {
  db.any("SELECT * FROM posts WHERE user_id=$1", req.params.id)
    .then(data => {
      // console.log(data);
      res.json(data);
    })
    .catch(error => {
      res.json(error);
    });
}


function registerUser(req, res, next) {
  console.log(req.body);
  return authHelpers
    .createUser(req)
    .then(response => {
      passport.authenticate("local", (err, user, info) => {
        if (user) {
          res.status(200).json({
            status: "success",
            data: user,
            message: "Registered one user"
          });
        }
      })(req, res, next);
    })
    .catch(err => {
      res.status(500).json({
        status: "error",
        error: err,
      });
    });
}

function follow(req, res, next) {
  return db.none(
    "INSERT INTO following (user_id, following_id) VALUES (${user_id}, ${following_id})",
    { user_id: req.user.user_id, following_id: req.params.following_id }
  );
}

module.exports = {
  registerUser: registerUser,
  loginUser: loginUser,
  logoutUser: logoutUser,
  getAllPictures: getAllPictures,
  follow: follow
};