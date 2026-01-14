import rateLimit from "express-rate-limit";

/**
 * Rate limiting configurations for different endpoint types
 * Prevents abuse and protects against DoS attacks
 */

// Strict rate limit for write operations (bookings, messages, reviews)
export const writeOperationsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // 20 requests per 15 minutes
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// Moderate rate limit for file uploads
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // 10 uploads per 15 minutes
  message: "Too many file uploads from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for review submissions
export const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5, // 5 reviews per hour
  message: "Too many reviews submitted, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit for booking creation
export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10, // 10 bookings per hour
  message: "Too many booking requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit for messaging
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 30, // 30 messages per minute
  message: "Too many messages sent, please slow down",
  standardHeaders: true,
  legacyHeaders: false,
});
