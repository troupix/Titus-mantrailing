module.exports = {
  apps : [{
    name   : "maximilien-api",
    script : "server.js",
    cwd    : "/home/ubuntu/maximilien/", // Set the correct working directory
    watch: false, // Explicitly disable file watching
    env_production: {
      NODE_ENV: "production"
    }
  }]
}
