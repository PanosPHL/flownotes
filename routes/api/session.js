const express = require("express");
const asyncHandler = require("express-async-handler");
const { check } = require("express-validator");

const { User, Category, Flow, Note, Video } = require("../../db/models");
const { handleValidationErrors } = require("../util/validation");
const { getCurrentUser, generateToken, AuthenticationError } = require("../util/auth");
const { jwtConfig: { expiresIn }} = require('../../config');

const router = express.Router();

const validateLogin = [
  check("email").exists(),
  check("password").exists(),
];

router.get(
  "/",
  getCurrentUser,
  asyncHandler(async function (req, res, next) {
    return res.json({
      user: req.user || {}
    });
  }));

router.get('/data', asyncHandler( async (req, res, next) => {
  return res.json({
    categories: await Category.findAll({}),
    flows: await Flow.findAll({
      include: {
        model: Note,
        as: 'notes',
        attribute: ['id']
      }
    }),
    notes: await Note.findAll({}),
    users: await User.findAll({}),
    videos: await Video.findAll({})
  });
}));

router.put(
  "/",
  validateLogin,
  handleValidationErrors,
  asyncHandler(async function (req, res, next) {
    const user = await User.login(req.body);
    if (user) {
      const token = await generateToken(user);
      res.cookie("token", token, {
        maxAge: expiresIn * 1000, // maxAge in milliseconds
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
      return res.json({
        user,
      });
    }
    return next(new Error('Invalid credentials'));
  })
);

router.delete('/', asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.json({
    message: 'Success'
  });
}));

module.exports = router;
