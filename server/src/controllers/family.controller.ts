import { Activity } from '../models/Activity.js';
import { Family, type FamilyRole } from '../models/Family.js';
import { User } from '../models/User.js';
import { ApiError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getFamilyForUser } from '../utils/familyAccess.js';
import { randomUUID } from 'crypto';

const roles: FamilyRole[] = ['Parent', 'Partner', 'Child'];

export const getCurrentFamily = asyncHandler(async (req, res) => {
  const familyId = await getFamilyForUser(req.user!.id);
  const family = await Family.findById(familyId).populate('members.user', 'name email avatar');

  res.json(family);
});

export const createFamily = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new ApiError(400, 'Family name is required');
  }

  const family = await Family.create({
    name,
    owner: req.user!.id,
    members: [{ user: req.user!.id, role: 'Parent' }]
  });

  await Activity.create({
    family: family._id,
    user: req.user!.id,
    action: `Created family ${family.name}`
  });

  res.status(201).json(family);
});

export const inviteMember = asyncHandler(async (req, res) => {
  const { name, email, role } = req.body;

  if (!name || !email || !role || !roles.includes(role)) {
    throw new ApiError(400, 'Name, valid email and role are required');
  }

  const familyId = await getFamilyForUser(req.user!.id);
  const family = await Family.findById(familyId);

  if (!family) {
    throw new ApiError(404, 'Family not found');
  }

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name,
      email,
      password: `temporary-${randomUUID()}`
    });
  }

  const alreadyMember = family.members.some((member) => member.user.equals(user!._id));
  if (!alreadyMember) {
    family.members.push({ user: user._id, role, joinedAt: new Date() });
    await family.save();
  }

  await Activity.create({
    family: family._id,
    user: req.user!.id,
    action: `Invited ${user.name} as ${role}`
  });

  const populatedFamily = await Family.findById(family._id).populate(
    'members.user',
    'name email avatar'
  );

  res.status(201).json({
    message: 'Invitation mocked and member added for the MVP',
    family: populatedFamily
  });
});

export const updateMemberRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!role || !roles.includes(role)) {
    throw new ApiError(400, 'A valid role is required');
  }

  const familyId = await getFamilyForUser(req.user!.id);
  const family = await Family.findById(familyId);

  if (!family) {
    throw new ApiError(404, 'Family not found');
  }

  const member = family.members.find((item) => item.user.toString() === req.params.userId);
  if (!member) {
    throw new ApiError(404, 'Family member not found');
  }

  member.role = role;
  await family.save();

  const populatedFamily = await Family.findById(family._id).populate(
    'members.user',
    'name email avatar'
  );

  res.json(populatedFamily);
});
