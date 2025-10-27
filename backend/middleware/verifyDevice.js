export const verifyDevice = (req, res, next) => {
    if (!req.user.is_verified) {
        return res.status(403).json({message:"Your device has not been approved by the admin."})
    }
    next();
}