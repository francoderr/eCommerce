import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: "",
  },
  username: {
    type: String,
    default: "",
  },
  productId: {
    type: String,
    default: "",
  },
  isOrdered: {
    type: Boolean,
    default: false
  },
  isBought: {
    type: Boolean,
    default: false,
  },
 
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
