import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Activity } from '../models/Activity.js';
import { Family } from '../models/Family.js';
import { User } from '../models/User.js';
import { ApiError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const createToken = (id: string, email: string) =>
  jwt.sign({ id, email }, env.jwtSecret, { expiresIn: '7d' });

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, familyName } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email and password are required');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'A user with this email already exists');
  }

  const user = await User.create({ name, email, password });
  const family = await Family.create({
    name: familyName || `${name.split(' ')[0]}'s Family`,
    owner: user._id,
    members: [{ user: user._id, role: 'Parent' }]
  });

  await Activity.create({
    family: family._id,
    user: user._id,
    action: `${user.name} created ${family.name}`,
    timestamp: new Date()
  });

  res.status(201).json({
    token: createToken(user.id, user.email),
    user,
    family
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const family = await Family.findOne({ 'members.user': user._id }).populate(
    'members.user',
    'name email avatar'
  );

  res.json({
    token: createToken(user.id, user.email),
    user,
    family
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  res.json({
    message: 'If an account exists, a password reset link will be sent. Email delivery is mocked for the MVP.'
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const family = await Family.findOne({ 'members.user': user._id }).populate(
    'members.user',
    'name email avatar'
  );

  res.json({ user, family });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.name = req.body.name ?? user.name;
  user.avatar = req.body.avatar ?? user.avatar;
  await user.save();

  res.json({ user });
});
