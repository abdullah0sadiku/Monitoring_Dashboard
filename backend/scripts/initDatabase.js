const { initDatabase } = require('../database/init');

async function main() {
  try {
    console.log('Initializing database...');
    await initDatabase();
    console.log('✅ Database initialized successfully!');
    console.log('Default admin user: admin@magicui.com / admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
}

main(); 