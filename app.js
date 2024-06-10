import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import session from "express-session";
import flash from "connect-flash";
import passport from "./passportConfig.js";
import { isAuthenticated, isAdmin } from "./middlewares/auth.js";
import User from "./models/User.js";
import routes from "./routes/routes.js";
import fileUpload from 'express-fileupload';


const app = express();

// Connect to MongoDB
mongoose.connect("mongodb://0.0.0.0:27017/NicolesDB2", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json({ limit: '50mb' })); 
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.json());

// Middleware to handle file uploads
app.use(fileUpload());

app.use("/", routes);

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login", { message: req.flash("error") });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { username, password, email } = req.body;
  const newUser = new User({ username, password, role: "user", email });
  await newUser.save();
  res.redirect("/login");
});

app.get("/dashboard", isAuthenticated, (req, res) => {
  res.render("dashboard", { user: req.user });
});

app.get("/users", isAdmin, (req, res) => {
  res.render("users", { user: req.user });
  console.log(req.user)
});

app.get("/editUzer/:userId", isAdmin, (req, res) => {
  res.render("editUzer", { user: req.user });
});

app.get("/createProd", isAdmin, (req, res) => {
  res.render("createProd", { user: req.user });
});

app.get("/products", isAdmin, (req, res) => {
  res.render("products", { user: req.user });
});

app.get("/myCart", isAuthenticated, (req, res) => {
  res.render("myCart", { user: req.user });
});

app.get("/checkout/:totalPrice?", isAuthenticated, (req, res) => {
  res.render("checkout", { user: req.user });
});

app.get("/not-authorized", (req, res) => {
  res.render("not-authorized");
});

app.get("/logout", (req, res) => {
  res.redirect("/login");
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
