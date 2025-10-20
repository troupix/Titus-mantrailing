module.exports = {
  apps : [{
    name   : "maximilien-api",
    script : "index.js",
    env_production: {
      NODE_ENV: "production",
      ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
      PORT: process.env.PORT,
      DB_NAME: process.env.DB_NAME,
      MONGODB_URI: process.env.MONGODB_URI,
      CORS_ORIGIN: process.env.CORS_ORIGIN
    }
  }]
}
