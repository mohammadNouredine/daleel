export default () => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  mongodb: {
    uri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/daleel',
  },
  auth: {
    secret: process.env.BETTER_AUTH_SECRET,
    url: process.env.BETTER_AUTH_URL ?? 'http://localhost:3001',
    trustedOrigins: process.env.TRUSTED_ORIGINS
      ? process.env.TRUSTED_ORIGINS.split(',').map((origin) => origin.trim())
      : ['http://localhost:3000', 'http://localhost:3001'],
  },
  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    fullName: process.env.ADMIN_FULL_NAME ?? 'Daleel Admin',
  },
  propertyListings: {
    softDeleteRetentionDays: parseInt(
      process.env.PROPERTY_SOFT_DELETE_RETENTION_DAYS ?? '30',
      10,
    ),
  },
  storage: {
    provider: process.env.STORAGE_PROVIDER ?? 'cloudinary',
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
      folderPrefix: process.env.CLOUDINARY_FOLDER_PREFIX ?? 'daleel',
    },
  },
});
