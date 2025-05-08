
import React from 'react';
import Auth from './Auth';

// This is a simple wrapper around Auth for backward compatibility
// The Auth component handles both login and register functionality
const Register = () => {
  // Pass state to make the Auth page open to the register tab by default
  return <Auth />;
};

export default Register;
