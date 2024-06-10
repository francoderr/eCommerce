import CartModel from "../models/Cart.js";
import ProductModel from "../models/Product.js";
import UserModel from "../models/User.js";
import { ObjectId } from "mongodb";

export const addToCart = async (req, res) => {
  const { productId } = req.body;
  const { username } = req.user;
  const userId = req.user._id;

  if (!userId) {
    return res.status(400).json({
      Status: "Failed",
      message: "User ID is required!",
    });
  }

  if (!username) {
    return res.status(400).json({
      Status: "Failed",
      message: "User name is required!",
    });
  }

  if (!productId) {
    return res.status(400).json({
      Status: "Failed",
      message: "Product ID is required!",
    });
  }

  try {
    // Check if the product exists
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        Status: "Failed",
        message: "Product not found!",
      });
    }

    // Check if the user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        Status: "Failed",
        message: "User not found!",
      });
    }

    // Check if the item is already in the cart
    const existingCartItem = await CartModel.findOne({ userId, productId });
    if (existingCartItem) {
      return res.status(400).json({
        Status: "Failed",
        message: "Product already in cart!",
      });
    }

    // Add product to cart
    const cartItem = new CartModel({
      userId,
      username,
      productId,
    });

    await cartItem.save();
    res.status(200).json({
      Status: "Success",
      message: "Product added to cart successfully!",
      cartItem: cartItem,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  const { productId } = req.body;
  
  let userId = req.user._id;
  userId = userId.toString();

  if (!userId) {
    return res.status(400).json({
      Status: "Failed",
      message: "User ID is required!",
    });
  }

  if (!productId) {
    return res.status(400).json({
      Status: "Failed",
      message: "Product ID is required!",
    });
  }

  try {
    // Find the cart item
    const cartItem = await CartModel.findOneAndDelete({ userId, productId });

    if (!cartItem) {
      return res.status(404).json({
        Status: "Failed",
        message: "Cart item not found!",
      });
    }

    res.status(200).json({
      Status: "Success",
      message: "Product removed from cart successfully!",
      cartItem: cartItem,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const makeOrder = async (req, res) => {
  let userId = req.user._id;
  userId = userId.toString();

  if (!userId) {
    return res.status(400).send("userId required to make order");
  }

  try {
    await CartModel.updateMany(
      { userId: userId },
      { $set: { isOrdered: true } }
    ).then((response) => {
      if (response.modifiedCount > 0) {
        res.status(200).json({
          Status: "Success",
          message: "Made the order successfuly!",
          data: response,
        });
      } else {
        res.status(500).json({
          Status: "FAILED",
          message: "Could not make order ...user has no items in cart",
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      Status: "Failed",
      message: "An error occurred while making order",
      error: error.message,
    });
  }
};

export const getCartItems = async (req, res) => {
  let userId = req.user._id;
  userId = userId.toString();

  if (!userId) {
    return res.status(400).send("userId required to get cart items");
  }

  try {
    await CartModel.aggregate([
      {
        $match: {
          userId,
        },
      },
      {
        $addFields: {
          productIdId: { $toObjectId: "$productId" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productIdId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $project: {
          id: "$_id",
          _id: 0,
          username: 1,
          userId: 1,
          productId: 1,
          title: "$productDetails.title",
          image: "$productDetails.image",
          description: "$productDetails.description",
          price: "$productDetails.price",
        },
      },
    ]).then((response) => {
      if (response) {
        res.status(200).json({
          Status: "Success",
          message: "fetched cart items successfuly!",
          data: response,
        });
      } else {
        res.status(500).json({
          Status: "FAILED",
          message: "Could not fetch cart items",
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      Status: "Failed",
      message: "An error occurred while fetching cart items",
      error: error.message,
    });
  }
};
