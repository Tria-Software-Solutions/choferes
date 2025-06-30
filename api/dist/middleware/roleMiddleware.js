"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRole = void 0;
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthenticated user" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied. You do not have enough permissions." });
    }
    next();
  };
};
exports.authorizeRole = authorizeRole;
//# sourceMappingURL=roleMiddleware.js.map
