module.exports = {
  apps : [{
    name   : "titus-mantrailing",
    script : "server.js",
    cwd    : "/home/ubuntu/titus-mantrailing/", // Set the correct working directory
    watch: false, // Explicitly disable file watching
    env_production: {
      NODE_ENV: "production"
    }
  }]
}
