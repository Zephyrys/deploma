
const accessControl = (action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const role = req.user.role;

    if (role === 'admin' && ((action === 'delete'|| action==='update-user'||action === 'create'||action === 'update'||action === 'read') )) {
      return next();
    }

    if (role === 'manager') {
      if (action === 'delete'|| action==='update-user') {
        return res.status(403).json({ message: 'Access denied: managers cannot delete' });
      }
      return next();
    }

    return res.status(403).json({ message: 'Access denied: insufficient permissions' });
  };
};

module.exports = { accessControl };
