require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/users");
const Book = require("../models/books");
const encPass = require("../helper/encPassword");
const data = require("../data/bookleaf_sample_data.json");

const PASSWORD = "Test@1234";

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  const hashed = await encPass(PASSWORD, "encrypt");

  await User.updateOne(
    { email: "admin@bookleaf.com" },
    { $set: { name: "BookLeaf Admin", password: hashed, role: "admin" } },
    { upsert: true }
  );

  await Book.deleteMany({});
  for (const author of data.authors) {
    await User.updateOne(
      { email: author.email },
      { $set: { name: author.name, password: hashed, role: "author", authorId: author.author_id } },
      { upsert: true }
    );

    const books = author.books.map((b) => ({ ...b, authorId: author.author_id }));
    await Book.insertMany(books);
  }

  console.log("Seeded! Login with any author email or admin@bookleaf.com, password:", PASSWORD);
  await mongoose.disconnect();
}

seed().catch(console.error);