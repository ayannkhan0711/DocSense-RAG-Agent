cat > server/controller/auth/authController.js << 'EOF'
import jwt from "jsonwebtoken"
import User from "../../models/User.js"

const generateToken = (user) =>
    jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    })

const userResponse = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
})

// POST /api/auth/register
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email and password are required" })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" })
        }

        const exists = await User.findOne({ email: email.toLowerCase() })
        if (exists) {
            return res.status(409).json({ message: "Email already registered" })
        }

        const user = await User.create({ name, email, password })

        res.status(201).json({ user: userResponse(user), token: generateToken(user) })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// POST /api/auth/login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" })
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select("+password")
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: "Invalid email or password" })
        }

        res.json({ user: userResponse(user), token: generateToken(user) })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// GET /api/auth/me  (protected)
export const getMe = async (req, res) => {
    res.json({ user: userResponse(req.user) })
}
EOF