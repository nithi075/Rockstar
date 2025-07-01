// Place this BEFORE the generic /:id route
router.put(
  '/:id/deliver',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  updateOrderStatusToDelivered
);

// Now this won't catch "/deliver" by mistake
router.get('/:id', isAuthenticatedUser, authorizeRoles('admin'), getSingleOrder);
router.put('/:id', isAuthenticatedUser, authorizeRoles('admin'), updateOrderStatus);
router.delete('/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);
