import express from 'express'

import { editUser, getUsers, login, signUp } from '../controllers/userController.js'
import { createProduct, editProduct, listProducts } from '../controllers/productController.js'
import { addToCart, getCartItems, makeOrder, removeFromCart } from '../controllers/cartController.js'
import { isAuthenticated, isAdmin } from "../middlewares/auth.js";
import { createToken, stkPush } from '../controllers/paymentController.js';

const router  = express.Router()

// router.post('/signup', signUp)
// router.post('/login', login)
router.get('/getUsers', getUsers)
router.post('/editUser', editUser)
router.post('/createProduct', createProduct)
router.post('/editProduct', editProduct)
router.get('/listProducts', listProducts)
router.post('/addToCart', isAuthenticated, addToCart)
router.get('/getCartItems', isAuthenticated, getCartItems)
router.post('/removeFromCart', removeFromCart)
router.post('/makeOrder', makeOrder)
router.post('/stkPush', createToken, stkPush)
export default router