export const isAuthenticated = (req, res, next) => {
    const userName = req.cookies.userName;
    const userRole = req.cookies.userRole;

    if (userName && userRole) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized access: Missing or invalid cookies' });
    }
};

export const isAdmin = (req, res, next) => {
    const userName = req.cookies.userName;
    const userRole = req.cookies.userRole;

    if (userName && userRole == 5150) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized access: Missing or invalid cookies' });
    }
};