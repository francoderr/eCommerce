import UserModel from "../models/User.js";
import bcrypt from "bcryptjs";

export const signUp = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists
    let user = await UserModel.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Create a new user
    user = new UserModel({
      username,
      email,
      password,
    });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save the user to the database
    await user.save();

    // Respond with success message
    res.status(200).json({ msg: "User created successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    let user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Check the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Respond with success message
    res.status(200).json({ msg: "Login successful" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await UserModel.aggregate([
      {
        $match: {},
      },
      {
        $project: {
          username: 1,
          email: 1,
          role: 1,
          createdAt: 1,
        },
      },
    ]);

    return res.status(200).json({
      Status: "Success",
      message: "Fetched Users!",
      users,
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const editUser = async (req, res) => {
  const userId = req.body.userId
  const { username, email, password } = req.body;

  console.log(req.body)

  if (!userId) {
      return res.status(400).json({
          Status: "Failed",
          message: "User ID is required!",
      });
  }

  if (!username && !email && !password) {
      return res.status(400).json({
          Status: "Failed",
          message: "At least one field (username, email, password) is required for update!",
      });
  }

  try {
      const user = await UserModel.findById(userId);
      if (!user) {
          return res.status(404).json({
              Status: "Failed",
              message: "User not found!",
          });
      }

      if (username) user.username = username;
      if (email) user.email = email;
      if (password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(password, salt);
      }

      await user.save();
      res.status(200).json({
          Status: "Success",
          message: "User updated successfully!",
          user: {
              id: user._id,
              username: user.username,
              email: user.email,
          },
      });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};