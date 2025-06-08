// Switch to the logtrail database
db = db.getSiblingDB('logtrail');

// Create the logs collection with some indexes for better performance
db.createCollection('logs');

// Create indexes for common query patterns
db.logs.createIndex({ "timestamp": -1 });
db.logs.createIndex({ "level": 1 });
db.logs.createIndex({ "source": 1 });
db.logs.createIndex({ "timestamp": -1, "level": 1 });

print('Database logtrail initialized with logs collection and indexes'); 