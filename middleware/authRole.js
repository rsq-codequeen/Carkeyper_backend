// middleware/authRole.js

// The Admin role ID, based on your seeded database structure, is 1.
const ADMIN_ROLE_ID = 1;

// Middleware function to check if the user is an Admin
const isAdmin = (req, res, next) => {
    // We rely on req.roleId being set by the verifyToken middleware
    if (!req.roleId) {
         // Should not happen if authJwt runs first, but a safeguard
        return res.status(403).send({
            message: 'Forbidden: Role information missing.'
        });
    }

    if (req.roleId === ADMIN_ROLE_ID) {
        // User is an Admin, proceed
        next();
    } else {
        // User is not an Admin (e.g., Driver or Mechanic), block access
        res.status(403).send({
            message: 'Forbidden: Requires Admin Role.'
        });
    }
};

export default {
    isAdmin
};

