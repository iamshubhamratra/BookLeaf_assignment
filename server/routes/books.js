const express = require("express");
const authFn = require("../middlewares/auth");
const { getBooks } = require("../controllers/booksController");

const router = express.Router();

router.get("/", authFn, getBooks);

module.exports = router;