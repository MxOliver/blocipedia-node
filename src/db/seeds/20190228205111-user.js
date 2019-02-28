'use strict';

const faker = require("faker");

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      email: faker.internet.email(),
      password: faker.internet.password(),
      createdAt: faker.date.recent(),
      updatedAt: faker.date.recent(),
      id: faker.random.number()
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
