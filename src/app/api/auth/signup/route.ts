import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

// Define interface for user data
interface UserData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: string;
  employeeId?: string;
}

// Helper function to handle errors
const handleError = (message: string, status: number = 400) => {
  console.error(`Signup Error (${status}):`, message);
  return NextResponse.json(
    { message },
    { status }
  );
};

export async function POST(request: Request) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return handleError('Invalid JSON payload');
    }

    const { name, email, password, phone, role = 'user' } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return handleError('Name, email, and password are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return handleError('Please enter a valid email address');
    }

    // Validate password length
    if (password.length < 6) {
      return handleError('Password must be at least 6 characters long');
    }

    try {
      // Connect to MongoDB
      await connectDB();
      console.log('Successfully connected to MongoDB');
      
      // Check if user already exists
      const existingUser = await User.findOne({ email }).select('_id').lean();
      console.log('Existing user check:', existingUser);

      if (existingUser) {
        return handleError('User with this email already exists');
      }

      // Create user (password will be hashed by the pre-save hook)
      const userData: UserData = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        phone: phone?.trim(),
        role,
      };

      // Only include employeeId if it's provided
      if (body.employeeId) {
        userData.employeeId = body.employeeId;
      }

      console.log('Creating user with data:', { ...userData, password: '[REDACTED]' });
      
      const user = await User.create(userData);
      console.log('User created:', { id: user._id, email: user.email });

      // Return user data without password
      const userObject = user.toObject();
      delete userObject.password;
      const userWithoutPassword = userObject;

      return NextResponse.json(
        { 
          user: userWithoutPassword, 
          message: 'User created successfully',
          success: true 
        },
        { status: 201 }
      );
    } catch (error: unknown) {
      console.error('Database operation failed:', {
        name: error instanceof Error ? error.name : 'Unknown',
        code: error && typeof error === 'object' && 'code' in error ? error.code : undefined,
        keyPattern: error && typeof error === 'object' && 'keyPattern' in error ? error.keyPattern : undefined,
        keyValue: error && typeof error === 'object' && 'keyValue' in error ? error.keyValue : undefined,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
        // Handle duplicate key error
        const keyPattern = error && typeof error === 'object' && 'keyPattern' in error ? error.keyPattern as Record<string, unknown> : {};
        const field = Object.keys(keyPattern)[0];
        return handleError(`${field} already exists`);
      } else if (error instanceof Error && error.name === 'ValidationError') {
        const validationError = error as { errors: Record<string, { message: string }> };
        const errors = Object.values(validationError.errors).map((err: { message: string }) => err.message);
        return handleError(errors.join(', '));
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return handleError('Database operation failed: ' + errorMessage, 500);
    }
  } catch (error: unknown) {
    console.error('Unexpected error in signup:', error);
    return handleError('An unexpected error occurred', 500);
  }
}