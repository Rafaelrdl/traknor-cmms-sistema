import prisma from '@/config/database';
import { 
  hashPassword, 
  comparePassword, 
  generateAccessToken, 
  generateRefreshToken 
} from '@/utils/auth';
import { AuthenticationError, NotFoundError, ConflictError } from '@/utils/errors';
import { 
  LoginInput, 
  CreateUserInput, 
  UpdateUserInput,
  UpdateUserPreferencesInput,
  UpdateUserSecurityInput
} from '@/validators/auth';
import { PaginationOptions, getPagination, buildPagination } from '@/utils/response';

export class UserService {
  async authenticate(loginData: LoginInput) {
    const { email, password } = loginData;
    
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        status: true,
      },
    });
    
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }
    
    if (user.status !== 'ACTIVE') {
      throw new AuthenticationError('Account is inactive');
    }
    
    const isValidPassword = await comparePassword(password, user.password);
    
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid credentials');
    }
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        last_login_at: new Date(),
        sessions_count: { increment: 1 }
      },
    });
    
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    };
  }
  
  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar_url: true,
        phone: true,
        department: true,
        position: true,
        preferences: true,
        two_factor_enabled: true,
        last_login_at: true,
        created_at: true,
        updated_at: true,
      },
    });
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    return user;
  }
  
  async listUsers(options: PaginationOptions = {}) {
    const { skip, take, page, limit } = getPagination(options);
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          avatar_url: true,
          phone: true,
          department: true,
          position: true,
          last_login_at: true,
          created_at: true,
          updated_at: true,
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.user.count(),
    ]);
    
    return {
      users,
      pagination: buildPagination(total, page, limit),
    };
  }
  
  async createUser(userData: CreateUserInput, creatorId: string) {
    const { email, ...rest } = userData;
    const normalizedEmail = email.toLowerCase();
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }
    
    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await hashPassword(tempPassword);
    
    const user = await prisma.user.create({
      data: {
        ...rest,
        email: normalizedEmail,
        password: hashedPassword,
        status: 'PENDING', // User needs to set password
        preferences: {
          theme: 'system',
          language: 'pt-BR',
          date_format: 'DD/MM/YYYY',
          time_format: '24h',
          notifications: {
            email: true,
            push: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar_url: true,
        phone: true,
        department: true,
        position: true,
        created_at: true,
      },
    });
    
    // TODO: Send welcome email with temp password
    
    return { user, tempPassword };
  }
  
  async updateUser(userId: string, updateData: UpdateUserInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Check email uniqueness if updating email
    if (updateData.email) {
      const normalizedEmail = updateData.email.toLowerCase();
      if (normalizedEmail !== user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });
        
        if (existingUser) {
          throw new ConflictError('Email already registered');
        }
      }
      updateData.email = normalizedEmail;
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar_url: true,
        phone: true,
        department: true,
        position: true,
        updated_at: true,
      },
    });
    
    return updatedUser;
  }
  
  async updateUserPreferences(userId: string, preferences: UpdateUserPreferencesInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    const currentPreferences = (user.preferences as any) || {};
    const updatedPreferences = {
      ...currentPreferences,
      ...preferences,
    };
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { preferences: updatedPreferences },
      select: {
        id: true,
        preferences: true,
        updated_at: true,
      },
    });
    
    return updatedUser;
  }
  
  async updateUserSecurity(userId: string, securityData: UpdateUserSecurityInput) {
    const { current_password, new_password, two_factor_enabled } = securityData;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true, two_factor_enabled: true },
    });
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Verify current password
    const isValidPassword = await comparePassword(current_password, user.password);
    if (!isValidPassword) {
      throw new AuthenticationError('Current password is incorrect');
    }
    
    const updateData: any = {};
    
    // Update password if provided
    if (new_password) {
      updateData.password = await hashPassword(new_password);
      updateData.last_password_change = new Date();
    }
    
    // Update 2FA setting
    if (two_factor_enabled !== undefined) {
      updateData.two_factor_enabled = two_factor_enabled;
      
      // Generate recovery codes if enabling 2FA
      if (two_factor_enabled && !user.two_factor_enabled) {
        const recoveryCodes = Array.from({ length: 8 }, () => 
          Math.random().toString(36).substring(2, 10).toUpperCase()
        );
        updateData.recovery_codes = recoveryCodes;
      }
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        two_factor_enabled: true,
        recovery_codes: true,
        last_password_change: true,
        updated_at: true,
      },
    });
    
    return updatedUser;
  }
  
  async deleteUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Soft delete by setting status to INACTIVE
    await prisma.user.update({
      where: { id: userId },
      data: { 
        status: 'INACTIVE',
        updated_at: new Date()
      },
    });
    
    return { message: 'User deactivated successfully' };
  }
}