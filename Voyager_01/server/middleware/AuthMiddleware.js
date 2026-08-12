const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
    // Development bypass: set DISABLE_AUTH=true in server/.env to skip JWT checks
    if (process.env.DISABLE_AUTH === 'true') {
        req.user = { id: 'dev', role: 'user' };
        return next();
    }

    const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  
        next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};
 

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Hello , this is not a protected route." });
        }
        next();
    };
};

module.exports = { authMiddleware, authorizeRoles };
